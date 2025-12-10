"use client";

import { useState, useCallback } from "react";
import { Upload, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoUploadZoneProps {
    onFileSelect: (file: File) => void;
    selectedFile: File | null;
    isUploading: boolean;
    uploadProgress: number;
    disabled?: boolean;
}

export function VideoUploadZone({
    onFileSelect,
    selectedFile,
    isUploading,
    uploadProgress,
    disabled,
}: VideoUploadZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith("video/")) {
                onFileSelect(file);
            }
        }
    }, [onFileSelect, disabled]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onFileSelect(files[0]);
        }
    }, [onFileSelect]);

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
                "relative border-2 border-dashed rounded-lg p-8 transition-all duration-300",
                "flex flex-col items-center justify-center min-h-[200px]",
                isDragOver && !disabled && "border-electric-blue bg-electric-blue/5 glow-blue",
                selectedFile && !isUploading && "border-green-500 bg-green-500/5",
                isUploading && "border-neon-orange bg-neon-orange/5",
                !isDragOver && !selectedFile && !isUploading && "border-border hover:border-muted-foreground",
                disabled && "opacity-50 cursor-not-allowed"
            )}
        >
            {isUploading ? (
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 text-neon-orange animate-spin" />
                    <div className="w-full max-w-xs">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-neon-orange transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <p className="font-mono text-sm text-muted-foreground text-center mt-2">
                            Uploading to IPFS... {uploadProgress}%
                        </p>
                    </div>
                </div>
            ) : selectedFile ? (
                <div className="flex flex-col items-center gap-3">
                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                    <div className="text-center">
                        <p className="font-mono text-sm text-foreground">{selectedFile.name}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                    </div>
                </div>
            ) : (
                <>
                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileInput}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={disabled}
                    />
                    <Upload className={cn(
                        "h-12 w-12 mb-4 transition-colors",
                        isDragOver ? "text-electric-blue" : "text-muted-foreground"
                    )} />
                    <p className="font-mono text-sm text-muted-foreground text-center">
                        <span className="text-electric-blue">Click to upload</span> or drag and drop
                    </p>
                    <p className="font-mono text-xs text-muted-foreground mt-1">
                        MP4, WebM, or MOV (max 500MB)
                    </p>
                </>
            )}
        </div>
    );
}

export default VideoUploadZone;
