"use client";

import { useState } from "react";
import useCourseStore from "@/store/courseStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { PlusCircle } from "lucide-react";

export default function AddLessonModal({ courseId, open, onOpenChange }) {
  const { createLesson, isLoading } = useCourseStore();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contentType: "video",
    order: "1",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("contentType", formData.contentType);
    data.append("order", formData.order);

    if (formData.contentType === "video" && videoFile) {
      data.append("video", videoFile);
    } else if (formData.contentType === "pdf" && pdfFile) {
      data.append("pdf", pdfFile);
    }

    if (thumbnail) {
      data.append("thumbnail", thumbnail);
    }

    const success = await createLesson(courseId, data);
    if (success) {
      // Reset form
      setFormData({
        title: "",
        description: "",
        contentType: "video",
        order: "1",
      });
      setVideoFile(null);
      setPdfFile(null);
      setThumbnail(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Lesson
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Lesson</DialogTitle>
          <DialogDescription>Upload a video or PDF lesson</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Lesson Title</Label>
            <Input
              id="lesson-title"
              placeholder="e.g., Introduction to React"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lesson-description">Description (Optional)</Label>
            <Textarea
              id="lesson-description"
              placeholder="Brief description of the lesson..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content-type">Lesson Type</Label>
            <Select
              value={formData.contentType}
              onValueChange={(value) =>
                setFormData({ ...formData, contentType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video Lesson</SelectItem>
                <SelectItem value="pdf">PDF Document</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.contentType === "video" ? (
            <div className="space-y-2">
              <Label htmlFor="video-file">Video File</Label>
              <Input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
                required
              />
              <p className="text-xs text-gray-500">Max size: 100MB</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="pdf-file">PDF File</Label>
              <Input
                id="pdf-file"
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                required
              />
              <p className="text-xs text-gray-500">Max size: 100MB</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="lesson-thumbnail">
              Lesson Thumbnail (Optional)
            </Label>
            <Input
              id="lesson-thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Lesson Order</Label>
            <Input
              id="order"
              type="number"
              min="1"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: e.target.value })
              }
              required
            />
            <p className="text-xs text-gray-500">
              Position in the course (1, 2, 3...)
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Lesson"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
