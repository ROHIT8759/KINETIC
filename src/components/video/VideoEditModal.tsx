"use client";

import { useState } from "react";
import { X, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { IPAsset } from "@/hooks/useStoryProtocol";

const SKILL_CATEGORIES = [
    "Fine Motor Skills",
    "Heavy Lifting",
    "Precision Assembly",
    "Food Preparation",
    "Construction",
    "Craftsmanship",
    "Agricultural Tasks",
    "Medical Procedures",
    "Other",
];

interface VideoEditModalProps {
    video: IPAsset;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updates: { title: string; description: string; skillCategory: string }) => Promise<void>;
}

export function VideoEditModal({ video, isOpen, onClose, onSave }: VideoEditModalProps) {
    const [title, setTitle] = useState(video.title);
    const [description, setDescription] = useState(video.description);
    const [skillCategory, setSkillCategory] = useState(video.skillCategory);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        setError(null);
        setIsSaving(true);

        try {
            await onSave({ title, description, skillCategory });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save changes");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-card border border-border/50 rounded-lg w-full max-w-md mx-4 p-6 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-mono text-lg font-bold text-electric-blue">
                        Edit Video
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-title" className="font-mono text-sm">
                            Title
                        </Label>
                        <Input
                            id="edit-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Video title"
                            className="font-mono bg-muted border-border"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-description" className="font-mono text-sm">
                            Description
                        </Label>
                        <Textarea
                            id="edit-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Video description"
                            className="font-mono bg-muted border-border min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-category" className="font-mono text-sm">
                            Skill Category
                        </Label>
                        <Select value={skillCategory} onValueChange={setSkillCategory}>
                            <SelectTrigger className="font-mono bg-muted border-border">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SKILL_CATEGORIES.map((cat) => (
                                    <SelectItem key={cat} value={cat} className="font-mono">
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                            <p className="font-mono text-xs text-red-400">{error}</p>
                        </div>
                    )}

                    {/* IPFS Info (read-only) */}
                    <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                        <p className="font-mono text-xs text-muted-foreground mb-1">
                            IPFS Hash (cannot be changed)
                        </p>
                        <p className="font-mono text-xs text-electric-blue truncate">
                            {video.videoUrl.replace("ipfs://", "")}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 font-mono"
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 bg-electric-blue hover:bg-electric-blue/80 text-black font-mono font-bold"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default VideoEditModal;
