import { CheckCircle2, ImageIcon, UploadIcon } from "lucide-react";
import {
    useCallback,
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

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);
    const { isSignedIn } = useOutletContext<AuthContext>();

    const processFile = useCallback(
        (file: File) => {
            if (!isSignedIn) {
                return;
            }

            setFile(file);
            setProgress(0);

            const reader = new FileReader();

            reader.onloadend = () => {
                if (!isSignedIn || typeof reader.result !== "string") {
                    return;
                }

                const base64Data = reader.result;
                const interval = setInterval(() => {
                    setProgress((previousProgress) => {
                        const nextProgress = previousProgress + PROGRESS_INCREMENT;

                        if (nextProgress >= 100) {
                            clearInterval(interval);
                            setTimeout(
                                () => onComplete?.(base64Data),
                                REDIRECT_DELAY_MS,
                            );

                            return 100;
                        }

                        return nextProgress;
                    });
                }, PROGRESS_INTERVAL_MS);
            };

            reader.readAsDataURL(file);
        },
        [isSignedIn, onComplete],
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

        if (droppedFile && droppedFile.type.startsWith("image/")) {
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
                        accept=".jpg,.jpeg,.png"
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
                        <p className="help">Maximum file size 50MB.</p>
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
