import React from "react";
import Modal from "react-modal";
import { useTheme } from "next-themes";
import { setSelectedBadge } from "@/actions/user-actions";

interface BadgeModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  renderBadges: () => JSX.Element | null;
}

const BadgeModal: React.FC<BadgeModalProps> = ({
  isOpen,
  onRequestClose,
  renderBadges,
}) => {
  const { theme } = useTheme();

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      border: "1px solid #ccc",
      background: theme === "dark" ? "#0a0a0a" : "#fff",
      overflow: "auto",
      borderRadius: "4px",
      outline: "none",
      padding: "20px",
      color: theme === "dark" ? "#fff" : "#0a0a0a",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.75)",
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      ariaHideApp={false}
      style={customStyles}
      contentLabel="Badge Modal"
    >
      <h2>Equip Your Badge</h2>
      {renderBadges()}
      <button onClick={onRequestClose}>Close</button>
    </Modal>
  );
};

export default BadgeModal;
