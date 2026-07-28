const PROJECT_PREFIX = 'roomate_project_';

const jsonError = (status, message, extra = {}) => {
    return new Response(JSON.stringify({ error: message, ...extra }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }

    })
}

const getUserId = async (userPuter) => {
    try {
        const user = await userPuter.auth.getUser();

        return user?.uuid || null;
    } catch {
        return null;
    }
}

router.post('/api/projects/save', async({ request, user }) => {
    try {
        const userPuter = user.puter;

        if(!userPuter) return jsonError(401, 'Authentication failed');

        const body = await request.json();
        const project = body?.project;
        const visibility = body?.visibility;

        if(!project?.id || !project?.sourceImage) return jsonError(400, 'Project ID and source image are required');

        const userId = await getUserId(userPuter);
        if(!userId) return jsonError(401, 'Authentication failed');

        const now = new Date().toISOString();
        const isPublic = visibility === 'public';
        const {
            ownerId: _ownerId,
            isPublic: _isPublic,
            sharedBy: _sharedBy,
            sharedAt: _sharedAt,
            ...projectData
        } = project;
        const payload = {
            ...projectData,
            ownerId: userId,
            isPublic,
            sharedBy: isPublic ? userId : null,
            sharedAt: isPublic ? now : null,
            updatedAt: now,
        }

        const key = `${PROJECT_PREFIX}${project.id}`;
        await userPuter.kv.set(key, payload);

        return { saved: true, id: project.id, project: payload };
    } catch (e) {
        return jsonError(500, 'Failed to save project', { message: e.message || 'Unknown error' });
    }

})

router.get('/api/projects/list', async ({ user }) => {
    try {
        const userPuter = user?.puter;

        if (!userPuter) return jsonError(401, 'Authentication failed');

        const projects = (await userPuter.kv.list(PROJECT_PREFIX, true))
            .map(({value}) => ({ ...value, isPublic: true}))

        return { projects };
    } catch (e) {
        return jsonError(500, 'Failed to list projects', { message: e.message || 'Unknown error' });
    }
});

router.get('/api/projects/get', async ({ request, user }) => {
    try {
        const userPuter = user?.puter;

        if (!userPuter) return jsonError(401, 'Authentication failed');

        const id = new URL(request.url).searchParams.get('id');
        if (!id) return jsonError(400, 'Project id is required');

        const project = await userPuter.kv.get(`${PROJECT_PREFIX}${id}`);

        return { project };
    } catch (e) {
        return jsonError(500, 'Failed to get project', { message: e.message || 'Unknown error' });
    }
});
