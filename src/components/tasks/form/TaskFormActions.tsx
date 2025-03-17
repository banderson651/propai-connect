
import { Button } from "@/components/ui/button";

interface TaskFormActionsProps {
  isEditing: boolean;
  onCancel: () => void;
}

export const TaskFormActions = ({ isEditing, onCancel }: TaskFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit">
        {isEditing ? "Update Task" : "Create Task"}
      </Button>
    </div>
  );
};
