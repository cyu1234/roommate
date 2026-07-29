import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type DragEvent,
} from "react";
import { useOutletContext } from "react-router";
import {
    PROGRESS_INCREMENT,
    PROGRESS_INTERVAL_MS,
    REDIRECT_DELAY_MS,
} from "../lib/constants";

interface UploadProps {
    onComplete?: (base64Data: string) => void;
}

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const [base64Data, setBase64Data] = useState<string | null>(null);
    const { isSignedIn } = useOutletContext<AuthContext>();
    const progressRef = useRef(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const completionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearUploadTimers = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (completionTimeoutRef.current) {
            clearTimeout(completionTimeoutRef.current);
            completionTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => clearUploadTimers, [clearUploadTimers]);

    useEffect(() => {
        if (progress !== 100 || !base64Data) {
            return;
        }

        completionTimeoutRef.current = setTimeout(() => {
            completionTimeoutRef.current = null;
            onComplete?.(base64Data);
        }, REDIRECT_DELAY_MS);

        return () => {
            if (completionTimeoutRef.current) {
                clearTimeout(completionTimeoutRef.current);
                completionTimeoutRef.current = null;
            }
        };
    }, [base64Data, onComplete, progress]);

    const processFile = useCallback(
        (file: File) => {
            if (
                !isSignedIn ||
                !ACCEPTED_IMAGE_TYPES.includes(file.type) ||
                file.size > MAX_FILE_SIZE_BYTES
            ) {
                return;
            }

            clearUploadTimers();
            setFile(file);
            setProgress(0);
            setBase64Data(null);
            progressRef.current = 0;

            const reader = new FileReader();

            reader.onloadend = () => {
                if (!isSignedIn || typeof reader.result !== "string") {
                    return;
                }

                setBase64Data(reader.result);
                intervalRef.current = setInterval(() => {
                    const nextProgress = Math.min(
                        progressRef.current + PROGRESS_INCREMENT,
                        100,
                    );

                    progressRef.current = nextProgress;
                    setProgress(nextProgress);

                    if (nextProgress === 100) {
                        clearUploadTimers();
                    }
                }, PROGRESS_INTERVAL_MS);
            };

            reader.readAsDataURL(file);
        },
        [clearUploadTimers, isSignedIn],
    );

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) {
            return;
        }

        const selectedFile = event.target.files?.[0];

        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (isSignedIn) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);

        if (!isSignedIn) {
            return;
        }

        const droppedFile = event.dataTransfer.files[0];

        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? "is-dragging" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="drop-input"
                        accept="image/jpeg,image/png"
                        disabled={!isSignedIn}
                        onChange={handleChange}
                    />

                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />
                        </div>
                        <p>
                            {isSignedIn
                                ? "Click to upload or drag and drop"
                                : "Sign in or sign up with Puter to upload"}
                        </p>
                        <p className="help">
                            Maximum file size {MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="upload-status">
                    <div className="status-content">
                        <div className="status-icon">
                            {progress === 100 ? (
                                <CheckCircle2 className="check" />
                            ) : (
                                <ImageIcon className="image" />
                            )}
                        </div>

                        <h3>{file.name}</h3>

                        <div className="progress">
                            <div className="bar" style={{ width: `${progress}%` }} />
                            <p className="status-text">
                                {progress < 100
                                    ? "Analyzing Floor Plan ..."
                                    : "Redirecting ..."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Upload;
