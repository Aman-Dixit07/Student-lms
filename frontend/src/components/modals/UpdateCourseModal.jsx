"use client";

import { useState, useEffect } from "react";
import useCourseStore from "@/store/courseStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function UpdateCourseModal({ open, onOpenChange, course }) {
  const { updateCourse, isLoading } = useCourseStore();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
      });
    }
  }, [course]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    if (thumbnail) {
      data.append("thumbnail", thumbnail);
    }

    const success = await updateCourse(course.id, data);
    if (success) {
      setThumbnail(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Course</DialogTitle>
          <DialogDescription>Edit your course details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="update-title">Course Title</Label>
            <Input
              id="update-title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="update-description">Description</Label>
            <Textarea
              id="update-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="update-thumbnail">
              Update Thumbnail (Optional)
            </Label>
            <Input
              id="update-thumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files[0])}
            />
            {course?.thumbnailUrl && !thumbnail && (
              <p className="text-xs text-gray-500">
                Current thumbnail will be kept if not changed
              </p>
            )}
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
              {isLoading ? "Updating..." : "Update Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
