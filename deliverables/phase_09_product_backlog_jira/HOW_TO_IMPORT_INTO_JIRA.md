# How to Set Up and Import TripMate Scrum Project into Jira

This guide provides step-by-step instructions to create the **TripMate Collaborative Travel Planning Platform** Scrum project in Atlassian Jira and import all Epics, User Stories, Tasks, and Sprints using the generated CSV artifact.

---

## Step 1: Create a New Jira Scrum Project
1. Log in to your Atlassian Jira instance (`https://your-domain.atlassian.net`).
2. Navigate to **Projects** → **Create Project**.
3. Under Templates, choose **Software Development** → **Scrum**.
4. Select **Team-managed project** or **Company-managed project** (both support the CSV structure).
5. Configure project details:
   - **Project Name:** `TripMate Collaborative Travel Platform`
   - **Project Key:** `TM`
6. Click **Next** / **Create Project**.

---

## Step 2: Configure the 4-Column Scrum Board Workflow
By default, Jira creates 3 columns (`TO DO`, `IN PROGRESS`, `DONE`). To satisfy the syllabus requirement:
1. Open the Scrum Board on the left navigation bar.
2. Click **Board Settings** (top-right `...` menu → **Board settings** or **Configure board**).
3. Click the **Columns** tab.
4. Click **Add Column**:
   - **Column Name:** `TESTING`
   - Map the `In Review` or `Testing` status to this column.
5. Reorder the columns left-to-right:
   - **[TO DO]** (Max WIP: None)
   - **[IN PROGRESS]** (Max WIP: 4)
   - **[TESTING]** (Max WIP: 3)
   - **[DONE]** (Max WIP: None)
6. Click **Save**.

---

## Step 3: Import the Backlog CSV File
1. In Jira top navigation bar, click the **Settings Cog (⚙)** → **System**.
2. In the left sidebar under *Import and Export*, select **External System Import**.
3. Choose **CSV**.
4. Click **Choose File** and upload:
   `C:\Users\tej30\Desktop\TripMate_Jira_and_Scrum_Deliverables\jira_product_backlog_import.csv`
5. Check **Use an existing configuration file** (leave unchecked if first time).
6. Click **Next**.
7. In the Project Mapping screen:
   - **Select Project:** `TripMate Collaborative Travel Platform (TM)`
   - **Date format:** `yyyy-MM-dd`
8. In the **Map Fields** screen, map the CSV headers to Jira fields:
   - `Issue Type` ➔ **Issue Type**
   - `Issue Key` ➔ **Issue Key** (or auto-generate)
   - `Parent Key` ➔ **Parent / Parent Key**
   - `Summary` ➔ **Summary**
   - `Description` ➔ **Description**
   - `Epic Name` ➔ **Epic Name**
   - `Priority` ➔ **Priority**
   - `Story Points` ➔ **Story Points** (or Story Point Estimate)
   - `Sprint` ➔ **Sprint**
   - `Status` ➔ **Status**
   - `Acceptance Criteria` ➔ **Acceptance Criteria** (or map to Description custom field)
9. Click **Next** → **Begin Import**.
10. Jira will import **4 Epics**, **12 User Stories**, and **16 Sub-Tasks** instantly!

---

## Step 4: Verify the Two Sprints in the Backlog
1. Navigate to **Backlog** in your Jira sidebar.
2. You will see two configured sprints:
   - **Sprint 1 (Weeks 1-2):** Committed **29 Story Points** (TM-101 to TM-106)
     - *Sprint Goal:* "Establish secure user authentication, trip creation, destination route planning, and fine-grained RBAC authorization foundation."
   - **Sprint 2 (Weeks 3-4):** Committed **26 Story Points** (TM-201 to TM-206)
     - *Sprint Goal:* "Deliver collaborative itinerary scheduling, task delegation, group expense splitting engine, audit logging, and containerized deployment."
3. Click **Start Sprint** on Sprint 1. As development completes, move tickets to Sprint 2.

---

## Step 5: View the Sprint Burndown & Velocity Reports
1. In Jira, navigate to **Reports** on the left menu.
2. Select **Burndown Chart**: View the linear guideline versus the actual story points burned across the 10-day cycle.
3. Select **Velocity Chart**: Verify the velocity metrics:
   - Sprint 1 Velocity: **29 Story Points**
   - Sprint 2 Velocity: **26 Story Points**
   - Average Velocity: **27.5 Story Points / Sprint**
