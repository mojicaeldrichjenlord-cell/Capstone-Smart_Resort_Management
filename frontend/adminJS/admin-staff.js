// Admin Staff Management: role checks are enforced by backend middleware.
// The browser never receives password hashes or can reset Admin/Customer accounts.
(() => {
  "use strict";
  let staff = [];
  let selectedId = null;
  const $ = id => document.getElementById(id);
  const roles = { staff:"Front Desk (Legacy)", frontdesk:"Front Desk",
    manager:"Manager", housekeeping:"Housekeeping" };
  function show(text, error=false) {
    $("staffPageStatus").textContent = text;
    $("staffPageStatus").style.color = error ? "#b91c1c" : "#0d766e";
    if (typeof showToast === "function") showToast(text, error?"error":"success");
  }
  function token() { return sessionStorage.getItem("adminToken") || ""; }
  async function api(path, options={}) {
    if (!token()) throw new Error("Administrator session missing. Log in again.");
    const response = await fetch(API_BASE + "/admin/staff" + path, {
      ...options,
      headers: {
        "Authorization": "Bearer " + token(),
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      },
      cache: "no-store"
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Staff request failed.");
    return data;
  }
  function verifyAdminUI() {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (String(user?.role || "").toLowerCase() === "admin" && token()) return true;
    } catch (_) {}
    window.location.assign("../authHTML/login.html");
    return false;
  }
  const field = (tag, value) => {
    const elem = document.createElement(tag);
    elem.textContent = String(value ?? "");
    return elem;
  };
  function selectedStaff() { return staff.find(s => Number(s.id) === selectedId); }
  function drawDirectory() {
    const text = $("staffSearch").value.trim().toLowerCase();
    const role = $("staffRoleFilter").value;
    const visible = staff.filter(s => {
      const normalizedRole = s.role === "staff" ? "frontdesk" : String(s.role);
      return (!role || normalizedRole === role) &&
        (!text || [s.fullname,s.email,s.role].join(" ").toLowerCase().includes(text));
    });
    $("staffListStatus").textContent = `${visible.length} visible / ${staff.length} staff account(s)`;
    const tbody = $("staffList");
    tbody.replaceChildren();
    if (!visible.length) {
      const row=document.createElement("tr"), cell=field("td","No matching staff accounts.");
      cell.colSpan=5;row.append(cell);tbody.append(row);return;
    }
    visible.forEach(s => {
      const row=document.createElement("tr");
      row.append(field("td",s.fullname),field("td",roles[s.role] || s.role),field("td",s.email));
      const statusCell=document.createElement("td"),pill=field("span",s.account_status || "unknown");
      pill.className="staff-tag" + (s.account_status === "disabled" ? " disabled":"");
      statusCell.append(pill);row.append(statusCell);
      const last=document.createElement("td"),button=field("button","Manage");
      button.type="button";button.addEventListener("click",()=>selectStaff(Number(s.id)));
      last.append(button);row.append(last);tbody.append(row);
    });
  }
  async function loadStaff() {
    try {
      $("refreshStaff").disabled=true;
      const result=await api("/");
      staff=Array.isArray(result.staff) ? result.staff : [];
      drawDirectory();
      if (selectedId && !selectedStaff()) clearForm();
      else if (selectedStaff()) updateSelectedActions();
    } catch(e) { show(e.message,true); }
    finally { $("refreshStaff").disabled=false; }
  }
  function updateSelectedActions() {
    const user=selectedStaff();
    $("selectedStaffActions").hidden=!user;
    $("selectedStaffLabel").textContent=user
      ? `${user.fullname} • ${roles[user.role]||user.role} • ${user.email}`
      : "Select Manage in the directory to edit, disable or reset a staff account.";
    if(user) $("staffStatusAction").textContent=
      user.account_status === "disabled" ? "Enable Account" : "Disable Account";
  }
  function selectStaff(id) {
    selectedId=id;
    const s=selectedStaff();
    if(!s) return;
    $("staffFormTitle").textContent="Edit Staff Profile";
    $("staffFormDescription").textContent="Update this staff member’s contact details. Use Reset Staff Password on the right to change their password.";
    $("staffFullname").value=s.fullname || "";
    $("staffEmail").value=s.email || "";
    $("staffPhone").value=s.phone || "";
    $("staffAddress").value=s.address || "";
    $("staffRole").value=s.role === "staff" ? "frontdesk" : s.role;
    $("staffRoleLabel").hidden=true; // Role is intentionally not editable.
    $("initialPasswordLabel").hidden=true;
    $("staffInitialPassword").required=false;
    $("staffInitialPassword").value="";
    $("staffPasswordHint").hidden=true;
    $("saveStaff").textContent="Save Profile Changes";
    $("staffResetForm").reset();
    updateSelectedActions();
    $("staffFormTitle").scrollIntoView({behavior:"smooth",block:"center"});
  }
  function clearForm() {
    selectedId=null;
    $("staffForm").reset();
    $("staffFormTitle").textContent="Create Staff Account";
    $("staffFormDescription").textContent="Create an account with a strong initial password. Give credentials only to the intended staff member.";
    $("staffRoleLabel").hidden=false;
    $("initialPasswordLabel").hidden=false;
    $("staffInitialPassword").required=true;
    $("staffPasswordHint").hidden=false;
    $("saveStaff").textContent="Create Account";
    $("staffResetForm").reset();
    updateSelectedActions();
  }
  async function saveProfile(event) {
    event.preventDefault();
    const payload={
      fullname:$("staffFullname").value.trim(),email:$("staffEmail").value.trim(),
      phone:$("staffPhone").value.trim(),address:$("staffAddress").value.trim()
    };
    if(!payload.fullname || !payload.email) return show("Name and email are required.",true);
    if(!selectedId) {
      payload.role=$("staffRole").value;
      payload.password=$("staffInitialPassword").value;
      if(!strong(payload.password)) return show("Use a strong initial password of 12–72 characters.",true);
    }
    const button=$("saveStaff");button.disabled=true;
    try {
      const result=await api(selectedId?"/"+selectedId:"",{
        method:selectedId?"PUT":"POST",body:JSON.stringify(payload)
      });
      show(result.message || "Staff saved.");
      clearForm(); await loadStaff();
    } catch(e){show(e.message,true);}
    finally {button.disabled=false;}
  }
  function strong(p) {
    return p.length>=12 && p.length<=72 && /[A-Z]/.test(p) && /[a-z]/.test(p) &&
      /[0-9]/.test(p) && /[^A-Za-z0-9\s]/.test(p);
  }
  async function changeStatus() {
    const s=selectedStaff();if(!s)return;
    const target=s.account_status==="disabled"?"active":"disabled";
    if(!window.confirm(`${target==="disabled"?"Disable":"Enable"} staff account for ${s.fullname}?`))return;
    const button=$("staffStatusAction");button.disabled=true;
    try{
      const result=await api("/"+s.id+"/status",{method:"PATCH",
        body:JSON.stringify({account_status:target})});
      show(result.message);await loadStaff();
    }catch(e){show(e.message,true);}finally{button.disabled=false;}
  }
  async function resetPassword(event) {
    event.preventDefault();
    const s=selectedStaff();if(!s)return;
    const newPassword=$("resetStaffPassword").value,
      confirmPassword=$("confirmStaffPassword").value,
      adminPassword=$("confirmAdminPassword").value;
    if(!strong(newPassword))return show("Use 12–72 characters with uppercase, lowercase, number and symbol.",true);
    if(newPassword!==confirmPassword)return show("New passwords do not match.",true);
    if(!adminPassword)return show("Enter your own Admin password.",true);
    if(!window.confirm(`Reset password for ${s.fullname}? Their previous sessions will expire.`))return;
    const button=$("resetStaffSubmit");button.disabled=true;
    try{
      const response=await api("/"+s.id+"/reset-password",{
        method:"POST",body:JSON.stringify({newPassword,adminPassword})
      });
      $("staffResetForm").reset();
      show(response.message || "Staff password reset.");
    }catch(e){show(e.message,true);}
    finally{button.disabled=false;}
  }
  function setupLogout(){
    $("logoutBtn")?.addEventListener("click",e=>{
      e.preventDefault();sessionStorage.removeItem("adminToken");
      localStorage.removeItem("user");window.location.assign("../authHTML/login.html");
    });
  }
  document.addEventListener("DOMContentLoaded",()=>{
    if(!verifyAdminUI())return;
    setupLogout();
    $("staffSearch").addEventListener("input",drawDirectory);
    $("staffRoleFilter").addEventListener("change",drawDirectory);
    $("refreshStaff").addEventListener("click",loadStaff);
    $("staffForm").addEventListener("submit",saveProfile);
    $("clearStaffForm").addEventListener("click",clearForm);
    $("staffStatusAction").addEventListener("click",changeStatus);
    $("staffResetForm").addEventListener("submit",resetPassword);
    loadStaff();
  });
})();
