import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Modal from "./Modal";
import { useWorkspace } from "./Workspace";
import { useToast } from "./Toast";
import { createGroup, joinGroup } from "../supabase/api";

function GroupModal() {
  const { groupModal, closeGroupModal, refresh } = useWorkspace();
  const toast = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState("create");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!groupModal.open) return;
    setTab(groupModal.tab || "create");
    setName("");
    setDescription("");
    setCode("");
    setError("");
  }, [groupModal.open, groupModal.tab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (tab === "create" && !name.trim()) return setError("Give your group a name.");
    if (tab === "join" && code.trim().length < 6) return setError("Enter the 8-character invite code.");

    setSaving(true);
    try {
      const group =
        tab === "create" ? await createGroup(name.trim(), description.trim()) : await joinGroup(code.trim());
      await refresh();
      toast.success(tab === "create" ? `Created “${group.name}”` : `You joined “${group.name}”`);
      closeGroupModal();
      navigate(`/client/groups/${group.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={groupModal.open}
      onClose={closeGroupModal}
      title={tab === "create" ? "Create a group" : "Join a group"}
      subtitle={
        tab === "create"
          ? "A shared space for a trip, a flat, a team — anything you split."
          : "Ask a member for the group’s invite code."
      }
      footer={
        <>
          <button type="button" className="pbtn pbtn-ghost" onClick={closeGroupModal}>
            Cancel
          </button>
          <button type="submit" form="group-form" className="pbtn pbtn-primary" disabled={saving}>
            {saving ? "Please wait…" : tab === "create" ? "Create group" : "Join group"}
          </button>
        </>
      }
    >
      <form id="group-form" className="pf-form" onSubmit={handleSubmit} noValidate>
        <div className="pf-segment">
          <button type="button" className={tab === "create" ? "active" : ""} onClick={() => setTab("create")}>
            Create new
          </button>
          <button type="button" className={tab === "join" ? "active" : ""} onClick={() => setTab("join")}>
            Join with code
          </button>
        </div>

        {error && <div className="pf-error" role="alert">{error}</div>}

        {tab === "create" ? (
          <>
            <label className="pf-field">
              <span className="pf-label">Group name</span>
              <input
                className="pf-input"
                placeholder="e.g. Trip to Tirana"
                maxLength={60}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </label>
            <label className="pf-field">
              <span className="pf-label">
                Description <span className="pf-hint">(optional)</span>
              </span>
              <input
                className="pf-input"
                placeholder="What is this group for?"
                maxLength={140}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>
          </>
        ) : (
          <label className="pf-field">
            <span className="pf-label">Invite code</span>
            <input
              className="pf-input pf-code"
              placeholder="A1B2C3D4"
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              autoFocus
            />
          </label>
        )}
      </form>
    </Modal>
  );
}

export default GroupModal;
