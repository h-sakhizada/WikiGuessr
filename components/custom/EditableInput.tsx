import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckIcon, PencilIcon } from "lucide-react";

interface EditableFieldProps {
  value?: string | null;
  onChange?: (value: string) => void;
  onSave?: () => void;
  label: string;
  id: string;
  isEditable: boolean;
  type?: "input" | "textarea";
  rows?: number;
}

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onChange,
  onSave,
  label,
  id,
  isEditable,
  type = "input",
  rows = 3,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [fieldValue, setFieldValue] = useState(value);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onChange?.(fieldValue ?? "");
    onSave?.();
    setIsEditing(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFieldValue(e.target.value);
  };

  const renderField = () => {
    if (!isEditable || !isEditing) {
      return (
        <p
          className={`flex-grow text-lg bg-transparent text-gray-800 dark:text-gray-200 p-2 rounded-md whitespace-pre ${
            !value ? "text-gray-400 dark:text-gray-400 italic" : ""
          }`}
        >
          {value ?? "N/A"}
        </p>
      );
    }

    if (type === "textarea") {
      return (
        <Textarea
          id={id}
          value={fieldValue ?? ""}
          onChange={handleChange}
          rows={rows}
          className="flex-grow bg-transparent text-gray-800 dark:text-gray-200 p-2 rounded-md whitespace-pre"
        />
      );
    }

    return (
      <Input
        id={id}
        type="text"
        value={fieldValue ?? ""}
        onChange={handleChange}
        className="flex-grow bg-transparent text-gray-800 dark:text-gray-200 p-2 rounded-md"
      />
    );
  };

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <div className="flex items-center space-x-2">
        {renderField()}
        {isEditable && (
          <Button
            variant="ghost"
            size="icon"
            onClick={isEditing ? handleSave : handleEdit}
          >
            {isEditing ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <PencilIcon className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EditableField;
