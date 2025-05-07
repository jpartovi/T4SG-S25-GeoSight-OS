
import { ProjectCheckpoint } from "./ProjectCheckpoint";

export interface StorySlide {
    id: string; // optional unique ID if needed
    title: string;
    description: string;
    checkpoint: ProjectCheckpoint;
}