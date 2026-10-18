import { supabase } from "./client";

function unwrap({ data, error }) {
  if (error) throw new Error(error.message || "Something went wrong");
  return data;
}

function requireClient() {
  if (!supabase) throw new Error("Supabase is not configured. Add your keys to .env.local.");
  return supabase;
}

// ---------------------------------------------------------------------
// WORKSPACE (everything the client dashboard needs, in one go)
// ---------------------------------------------------------------------

export async function fetchWorkspace(userId) {
  const sb = requireClient();

  const memberships = unwrap(
    await sb.from("group_members").select("group_id").eq("user_id", userId)
  );
  const groupIds = memberships.map((m) => m.group_id);

  if (!groupIds.length) {
    return { groups: [], members: [], expenses: [], settlements: [] };
  }

  const [groups, members, expenses, settlements] = await Promise.all([
    sb.from("groups").select("*").in("id", groupIds).order("created_at", { ascending: true }),
    sb
      .from("group_members")
      .select("group_id, user_id, role, joined_at, profile:profiles(id, full_name, email)")
      .in("group_id", groupIds)
      .order("joined_at", { ascending: true }),
    sb
      .from("expenses")
      .select("*, splits:expense_splits(user_id, amount)")
      .in("group_id", groupIds)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false }),
    sb
      .from("settlements")
      .select("*")
      .in("group_id", groupIds)
      .order("created_at", { ascending: false }),
  ]);

  return {
    groups: unwrap(groups),
    members: unwrap(members),
    expenses: unwrap(expenses),
    settlements: unwrap(settlements),
  };
}

// ---------------------------------------------------------------------
// GROUPS
// ---------------------------------------------------------------------

export async function createGroup(name, description = "") {
  return unwrap(await requireClient().rpc("create_group", { p_name: name, p_description: description }));
}

export async function joinGroup(code) {
  return unwrap(await requireClient().rpc("join_group", { p_code: code }));
}

export async function addMemberByEmail(groupId, email) {
  return unwrap(await requireClient().rpc("add_member_by_email", { p_group_id: groupId, p_email: email }));
}

export async function updateGroup(groupId, fields) {
  return unwrap(await requireClient().from("groups").update(fields).eq("id", groupId).select().single());
}

export async function deleteGroup(groupId) {
  return unwrap(await requireClient().from("groups").delete().eq("id", groupId));
}

export async function leaveGroup(groupId) {
  return unwrap(await requireClient().rpc("leave_group", { p_group_id: groupId }));
}

export async function removeMember(groupId, userId) {
  return unwrap(
    await requireClient().from("group_members").delete().eq("group_id", groupId).eq("user_id", userId)
  );
}

// ---------------------------------------------------------------------
// EXPENSES
// ---------------------------------------------------------------------

/** splits: [{ user_id, amount }] with amounts in euros (2 decimals) */
export async function createExpense({ groupId, description, amount, paidBy, splits, category, date }) {
  return unwrap(
    await requireClient().rpc("create_expense", {
      p_group_id: groupId,
      p_description: description,
      p_amount: amount,
      p_paid_by: paidBy,
      p_splits: splits,
      p_category: category,
      p_expense_date: date,
    })
  );
}

export async function deleteExpense(expenseId) {
  return unwrap(await requireClient().from("expenses").delete().eq("id", expenseId));
}

// ---------------------------------------------------------------------
// SETTLEMENTS
// ---------------------------------------------------------------------

export async function createSettlement({ groupId, fromUser, toUser, amount, note = "", createdBy }) {
  return unwrap(
    await requireClient().from("settlements").insert({
      group_id: groupId,
      from_user: fromUser,
      to_user: toUser,
      amount,
      note,
      created_by: createdBy,
    })
  );
}

export async function deleteSettlement(id) {
  return unwrap(await requireClient().from("settlements").delete().eq("id", id));
}

// ---------------------------------------------------------------------
// PROFILE
// ---------------------------------------------------------------------

export async function fetchProfile(userId) {
  return unwrap(await requireClient().from("profiles").select("*").eq("id", userId).maybeSingle());
}

export async function updateProfileName(userId, fullName) {
  const sb = requireClient();
  const profile = unwrap(
    await sb.from("profiles").update({ full_name: fullName }).eq("id", userId).select().single()
  );
  await sb.auth.updateUser({ data: { full_name: fullName } });
  return profile;
}

export async function updatePassword(password) {
  return unwrap(await requireClient().auth.updateUser({ password }));
}

// ---------------------------------------------------------------------
// ADMIN (RLS lets admins read/modify everything)
// ---------------------------------------------------------------------

export async function adminFetchAll() {
  const sb = requireClient();
  const [profiles, groups, members, expenses, settlements] = await Promise.all([
    sb.from("profiles").select("*").order("created_at", { ascending: false }),
    sb.from("groups").select("*").order("created_at", { ascending: false }),
    sb.from("group_members").select("group_id, user_id, role"),
    sb
      .from("expenses")
      .select("*, splits:expense_splits(user_id, amount)")
      .order("created_at", { ascending: false }),
    sb.from("settlements").select("*").order("created_at", { ascending: false }),
  ]);
  return {
    profiles: unwrap(profiles),
    groups: unwrap(groups),
    members: unwrap(members),
    expenses: unwrap(expenses),
    settlements: unwrap(settlements),
  };
}

export async function adminSetRole(userId, role) {
  return unwrap(await requireClient().from("profiles").update({ role }).eq("id", userId).select().single());
}
