# 6. Real Estate Agencies — Property Listing Website + Lead Capture Bot

Status: In progress
Task Left: / Tasks are completed.
Done: No
Created time: 24 November 2025 10:21
Last edited time: 26 November 2025 20:27
Description: Service: A modern website with AI-generated property descriptions, photo optimization, and a Telegram bot for inquiries.Skills Demonstrated: Web development, AI content generation, hosting.Client Benefit: More leads, automated responses, and professional online presence.

## Project Details

# 📁 [Project Name]

**Industry:** Real Estate

**Project Type:** Website with Automated features.

**Complexity:** ⭐⭐(Medium)

**Timeline:** 2 Weeks

**Status:**  🔴 Planning

**Live Demo:** [URL]

**GitHub Repo:** [URL]

**Case Study:** [Link to case study page]

---

## 📋 Quick Summary

**One-sentence description:**
This project helps tenants and potential tenants find and connect with different landlords easily on one platform.

**Key Technologies:**
- React
- Supabase
- Render

**Main Features:**
- Property Search
- Property Query
- Property Save

---

# PHASE 1: Discovery & Understanding

## 🏢 Fictional Client Profile

**Company Name:** Pezani Estates

**Industry:** Real- Estate

**Size:** 2 employees

**Location:** Malawi

**Years in Business:** 3

### Current Situation

**What they do:**
They help tenants find houses for rent

**How they currently operate:**
- they manually go around asking for which houses are for rent, where, and how much 
- they wait for people to reach out and ask them and they answer each one individually, and help them with the viewing also one at a time.
- they charge comissioins per viewing.

**Tools they currently use:**
- Smart phones
-  Whatsapp, Facebook groups.
- Manual processes: Manually sending each client pictures of the location and answering details of the property.

---

## 🔴 Pain Points Identified

### Pain Point #1: Usually No or Inacurate pictures available

**Description:** Most houses are usually just available in verbal descriptions, not with good quality pictures

**Current Impact:**
- Time wasted: you can spend between 2 and 24 hours a month visiting properties that dont fit what you are looking for, due to greedy agents.
- Money lost: betweeno 60.000 and 360.000 paid to agents as viewing fees and also transportation costs

**Current Workaround:** [How they deal with it now] - Tenants have to give clear cut descriptions of their desired property to rent and hope for the best.

---

### Pain Point #2: Deceitful agents

**Description:** Usually agents tend to scam people just to charge viewing fees on properties that arent available.

**Current Impact:**
- Time wasted:  >5 hours
- Money lost: >60.000

**Current Workaround:** [How they deal with it now] none.

---

---

## 🎯 Business Goals

**Primary Goal:** Create a place where tenants can find properties listed easily.

**Secondary Goals:**
- Tenants can easily find properties in their prefered locations.
- No more relying on 5-6 different agents just to find one house.

**Success Metrics:**
- Users able to save more than 2 properties in their profile
- Easy to book property viewing.
- More landlords visible to tenants.

---

## 💰 Budget & Timeline Assumptions

**Assumed Budget:** $200 - $1000

**Timeline Requirement:** [2 weeks]

**Critical Deadline:** N/A

---

# PHASE 2: Solution Design

## 🎨 Solution Overview

**High-Level Description:**
[2-3 paragraph description of the solution approach

we will approach this by having a website with 4 types of users, tenants, landlords, agents and.

tenants will be able to have an account to save the properties they are interested in.

landlords will have accounts that will let them post their properties and its details.

agents will be able to help tenants make viewings, although i am not really sure best use case of the agent user type

browsers are just people taking a look.

]

**Why This Approach:**
best approach and removes agents as gatekeepers of houses available for rent.

---

## 🏗️ System Architecture

**Architecture Type:** Monolithic Frontend + BaaS (Backend-as-a-Service)

**Components:**

1. **Frontend/Interface:** React SPA hosted on Render. Serves all user types with responsive design for mobile-first users. Handles property browsing, search/filtering, user dashboards, and listing management.
2. **Backend/API:** Supabase (Auth + PostgreSQL + Storage + auto-generated REST API). Row Level Security (RLS) policies control data access by user role.
3. **Database:** PostgreSQL managed by Supabase. Stores users, properties, saved listings, viewing requests, and payment records.
4. **External Services:**
    - Supabase Auth emails (password reset, email verification)
    - Paychangu (viewing fee payments)
5. **Automation Layer:**
    - Email notifications when viewing is requested
    - Email notifications when viewing payment is confirmed
    
    ---
    

## 🔧 Technical Stack

### Frontend

- **Framework:** React (with Vite for faster dev experience)
- **Styling:** Tailwind CSS (rapid UI development, mobile-responsive utilities)
- **State Management:** React Context API + React Query (for server state/caching)
- **Routing:** React Router v6

### Backend

- **Platform:** Supabase
- **API Type:** REST (auto-generated by Supabase) + Supabase JS Client
- **Auth:** Supabase Auth (email/password)
- **Storage:** Supabase Storage (property images)

### Database

- **Type:** SQL
- **System:** PostgreSQL (Supabase-managed)
- **ORM:** Supabase JS Client (handles queries directly)

### Infrastructure

- **Frontend Hosting:** Render (Static Site)
- **Backend/DB Hosting:** Supabase (Free tier to start)
- **Domain:** TBD
- **SSL:** Included with Render and Supabase

### Integrations

- Supabase Auth (email verification, password reset)
- Paychangu (viewing payments)

### Development Tools

- **Version Control:** Git + GitHub
- **Package Manager:** npm
- **Testing:** Manual testing for MVP (add Vitest post-launch)
- **Deployment:** GitHub → Render (auto-deploy on push)

---

---

Great - React + Tailwind with Cursor AI will speed things up significantly, and having Paychangu ready removes a major blocker.

Let's tackle the **Features List**. This is critical for your 2-week timeline, so we need to be ruthless about what's MVP vs. nice-to-have.

---

## ✨ Features List

[✨ Features List](https://www.notion.so/Features-List-2b77677bc6968054ae53cd8afa186817?pvs=21)

---

## 👥 User Roles & Permissions

---

### Role 1: Admin

**Who:** Platform owner (you)

**Number of Users:** 1

**Permissions:**

- ✅ Full system access
- ✅ Approve/reject agent applications
- ✅ Remove any listing
- ✅ View all users and data
- ✅ Access admin dashboard

**Primary Tasks:**

- Review and approve agent registrations
- Remove fraudulent or inappropriate listings
- Monitor platform activity

---

### Role 2: Landlord

**Who:** Property owners listing their own properties

**Number of Users:** Unlimited

**Permissions:**

- ✅ Create property listings
- ✅ Edit/delete own listings
- ✅ Set viewing fee per property
- ✅ Receive viewing requests
- ✅ View own dashboard with stats
- ❌ Cannot approve agents
- ❌ Cannot modify other users' listings

**Primary Tasks:**

- List properties with photos and details
- Respond to viewing requests
- Mark properties as available/unavailable

---

### Role 3: Agent (Verified)

**Who:** Real estate agents who list on behalf of landlords

**Number of Users:** Limited (requires approval)

**Permissions:**

- ✅ Create property listings (on behalf of landlords)
- ✅ Edit/delete own listings
- ✅ Set viewing fee per property
- ✅ Receive and coordinate viewing requests
- ✅ View own dashboard with stats
- ❌ Cannot access platform until approved
- ❌ Cannot approve other agents
- ❌ Cannot modify other users' listings

**Primary Tasks:**

- List multiple properties
- Coordinate viewings between tenants and landlords
- Manage portfolio of listings

**Verification Flow:**

1. User registers and selects "Agent" role
2. Account created with `status: pending`
3. Agent cannot access full features (sees "pending approval" message)
4. Admin reviews and approves/rejects
5. On approval, agent gets full access + welcome email

---

### Role 4: Tenant

**Who:** People looking to rent properties

**Number of Users:** Unlimited

**Permissions:**

- ✅ Browse all listings
- ✅ Search and filter properties
- ✅ Save properties to favorites
- ✅ Request viewings (with payment)
- ✅ View own dashboard (saved, viewing history)
- ❌ Cannot create listings
- ❌ Cannot access landlord/agent features

**Primary Tasks:**

- Search for properties
- Save interesting properties
- Request and pay for viewings

---

### Role 5: Browser (Guest)

**Who:** Non-registered visitors

**Number of Users:** Unlimited

**Permissions:**

- ✅ Browse all listings
- ✅ Search and filter properties
- ✅ View property details and images
- ❌ Cannot save properties
- ❌ Cannot request viewings
- ❌ Cannot contact landlords/agents
- ❌ No dashboard access

**Primary Tasks:**

- Explore available properties
- Decide whether to register

---

**Permission Matrix Summary:**

| Action | Admin | Landlord | Agent | Tenant | Browser |
| --- | --- | --- | --- | --- | --- |
| Browse listings | ✅ | ✅ | ✅ | ✅ | ✅ |
| View property details | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create listings | ✅ | ✅ | ✅* | ❌ | ❌ |
| Edit own listings | ✅ | ✅ | ✅* | ❌ | ❌ |
| Delete own listings | ✅ | ✅ | ✅* | ❌ | ❌ |
| Save properties | ✅ | ✅ | ✅ | ✅ | ❌ |
| Request viewing | ✅ | ✅ | ✅ | ✅ | ❌ |
| Receive viewing requests | ❌ | ✅ | ✅* | ❌ | ❌ |
| Approve agents | ✅ | ❌ | ❌ | ❌ | ❌ |
| Remove any listing | ✅ | ❌ | ❌ | ❌ | ❌ |
| View all users | ✅ | ❌ | ❌ | ❌ | ❌ |
- Agent features require approval first

---

## 🔄 Key Workflows

[Key Workflows](https://www.notion.so/Key-Workflows-2b77677bc69680eba5b5f93ed2ab4a0b?pvs=21)

---

---

---

## 🗄️ Database Schema

[🗄️ Database Schema](https://www.notion.so/Database-Schema-2b77677bc6968015bc70e32dd88e1557?pvs=21)

---

---

## 🎨 UI/UX Design

[Animation guide](https://www.notion.so/Animation-guide-2b77677bc69680b6bd41eab15574a312?pvs=21)

[🎨 UI/UX Design](https://www.notion.so/UI-UX-Design-2b77677bc69680ddb6d0f8faeaf97e3a?pvs=21)

---

# PHASE 3: Technical Specifications

## 🔐 Security Considerations

[🔐 Security Considerations](https://www.notion.so/Security-Considerations-2b77677bc6968057ae2ef31ef74b224b?pvs=21)

---

---

## ⚡ Performance Considerations

[⚡ Performance Considerations](https://www.notion.so/Performance-Considerations-2b77677bc6968086b997d04c50fc85f2?pvs=21)

---

---

## 📊 Analytics & Monitoring

[📊 Analytics & Monitoring](https://www.notion.so/Analytics-Monitoring-2b77677bc69680a3b3a1e5bb0b099b30?pvs=21)

- [ ]  Set up weekly automated reports

---

---

## 🧪 Testing Strategy

[Pezani_Estates_Testing_Strategy](https://www.notion.so/Pezani_Estates_Testing_Strategy-2b77677bc696815d9ecdcd54d8df8e95?pvs=21)

---

# PHASE 4: Development Milestones

## 

[Pezani_Estates_2_Week_Sprint_Checklist](https://www.notion.so/Pezani_Estates_2_Week_Sprint_Checklist-2b77677bc69681538528c3550ea9fb9b?pvs=21)

[Pezani_Estates_Development_Milestones](https://www.notion.so/Pezani_Estates_Development_Milestones-2b77677bc6968154943df7a24a268f0a?pvs=21)

---

# PHASE 5: Final Deliverables

[Pezani_Estates_Phase_5_Final_Deliverables](https://www.notion.so/Pezani_Estates_Phase_5_Final_Deliverables-2b77677bc69681cdb65df1d768af4f53?pvs=21)

## 🌐 Live System

**Production URL:** [URL]

**Admin Panel:** [URL]

**Bot Link:** [URL if applicable]

**Test Credentials:**

```
Admin:
Username: [username]
Password: [password]

Staff:
Username: [username]
Password: [password]
```

**Status:** 🟢 Live and operational

---

## 📚 Documentation

### User Guide

**Link:** [URL or file]

**Contents:**
- Getting started
- Feature walkthroughs
- Common tasks
- Troubleshooting
- FAQ

### Admin Manual

**Link:** [URL or file]

**Contents:**
- Admin panel overview
- User management
- Content management
- Settings configuration
- Maintenance tasks

### Bot Commands Guide (if applicable)

**Link:** [URL or file]

**Contents:**
- Command list
- Usage examples
- Best practices

### Technical Documentation

**Link:** [URL or file]

**Contents:**
- Setup instructions
- API documentation
- Database schema
- Deployment guide
- Architecture overview

---

## 💻 Source Code

**GitHub Repository:** [URL]

**Repository Structure:**

```
/
├── backend/
├── frontend/
├── docs/
├── tests/
├── README.md
└── .env.example
```

**README Quality Checklist:**
- [ ] Project description
- [ ] Features list
- [ ] Tech stack
- [ ] Installation instructions
- [ ] Usage examples
- [ ] Screenshots
- [ ] API documentation
- [ ] Contributing guidelines
- [ ] License

---

# PHASE 6: Case Study

## 📈 Results & Impact

### Quantifiable Improvements

**Time Savings:**
- Before: [X hours/week] spent on [task]
- After: [Y hours/week] spent on [task]
- **Savings: [Z hours/week] ([percentage]% reduction)**

**Cost Savings:**
- Before: $[X]/month lost to [issue]
- After: $[Y]/month lost to [issue]
- **Savings: $[Z]/month**

**Efficiency Gains:**
- [Metric]: Improved from [X] to [Y] ([percentage]% improvement)
- [Metric]: Improved from [X] to [Y] ([percentage]% improvement)
- [Metric]: Improved from [X] to [Y] ([percentage]% improvement)

**ROI Calculation:**
- Total investment: $[X]
- Monthly savings: $[Y]
- **Payback period: [Z months]**
- **5-year ROI: $[amount]**

---

## 🎯 Problems Solved

### Problem 1: [Pain Point Name]

**Before:** [Description of issue]

**Solution:** [What was implemented]

**Result:** [Measurable outcome]

**Screenshot:** [Before/after comparison]

---

### Problem 2: [Pain Point Name]

[Same structure]

---

### Problem 3: [Pain Point Name]

[Same structure]

---

## 💡 Technical Challenges & Solutions

### Challenge 1: [Description]

**Problem:** [What went wrong or was difficult]

**Solution:** [How you solved it]

**Learning:** [What you learned]

**Code Example:** [Optional - link to specific commit or code snippet]

---

### Challenge 2: [Description]

[Same structure]

---

## 🎨 Feature Showcase

### Feature 1: [Name]

**Description:** [What it does]

**Screenshot:** [Image]

**Technical Implementation:** [Brief technical note]

**User Benefit:** [What problem it solves]

---

### Feature 2: [Name]

[Same structure]

---

## 🎬 Demo Video

**Link:** [YouTube/Loom/Video link]

**Duration:** [X minutes]

**Contents:**
- [ ] System overview
- [ ] Key features demonstration
- [ ] User workflows
- [ ] Admin panel tour
- [ ] Bot demonstration (if applicable)
- [ ] Mobile responsiveness

---

## 💬 Testimonial (Optional)

> “[Simulated testimonial or feedback from beta testers]”
> 
> 
> — [Name], [Title] at [Company]
> 

---

# Portfolio Presentation

## 📄 One-Page Summary

**[Project Name] - [Industry] Solution**

A modern [type of system] that helps [target audience] [main benefit].

**Key Features:**
• [Feature 1]

• [Feature 2]

• [Feature 3]

**Technologies:** [Tech 1] • [Tech 2] • [Tech 3]

**Results:** [Key metric] • [Key metric] • [Key metric]

**View Full Case Study →** [Link]

---

## 🖼️ Marketing Assets

### Project Thumbnail

[Image for portfolio grid - 1200x630px]

### Social Media Graphics

- LinkedIn: [Image - 1200x627px]
- Twitter: [Image - 1200x675px]
- Instagram: [Image - 1080x1080px]

### Feature Screenshots

- [Feature 1 screenshot]
- [Feature 2 screenshot]
- [Feature 3 screenshot]
- [Mobile view]
- [Admin panel]

---

## 📝 Presentation Scripts

### 30-Second Pitch

“[Project Name] is a [solution type] I built for [industry]. It [main feature 1], [main feature 2], and [main feature 3]. The result was [key metric improvement]. I used [main tech] to build it. Want to see a demo?”

### 2-Minute Demo Script

[Detailed walkthrough script for discovery calls]

### Email Template

```
Subject: [Project Name] - Portfolio Case Study

Hi [Name],

I recently completed a [type] system for the [industry]
industry that might interest you.

The project included:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Results:
- [Metric 1]
- [Metric 2]
- [Metric 3]

You can view the full case study and live demo here: [Link]

Would you like to discuss how a similar solution could work
for [their business]?

Best,
[Your name]
```

---

# Project Checklist

## Pre-Development

- [ ]  Client profile created
- [ ]  Pain points documented
- [ ]  Solution designed
- [ ]  Tech stack selected
- [ ]  Database schema designed
- [ ]  Features list finalized
- [ ]  Wireframes created

## Development

- [ ]  All milestones completed
- [ ]  All features implemented
- [ ]  Testing completed
- [ ]  Bugs fixed
- [ ]  Performance optimized
- [ ]  Security reviewed

## Documentation

- [ ]  User guide written
- [ ]  Admin manual written
- [ ]  Bot commands documented (if applicable)
- [ ]  Technical docs completed
- [ ]  README.md polished
- [ ]  Code commented

## Deployment

- [ ]  Deployed to production
- [ ]  Domain configured
- [ ]  SSL enabled
- [ ]  Monitoring setup
- [ ]  Backups configured
- [ ]  Analytics integrated

## Portfolio Presentation

- [ ]  Case study written
- [ ]  Screenshots captured
- [ ]  Demo video recorded
- [ ]  GitHub repository public
- [ ]  One-page summary created
- [ ]  Marketing assets created
- [ ]  Added to portfolio website
- [ ]  LinkedIn post drafted

---

# Notes & Learnings

## What Went Well

- [Success 1]
- [Success 2]
- [Success 3]

## What Could Be Improved

- [Area 1]
- [Area 2]
- [Area 3]

## Technical Skills Gained

- [Skill 1]
- [Skill 2]
- [Skill 3]

## What I’d Do Differently Next Time

- [Learning 1]
- [Learning 2]
- [Learning 3]

---

**Project Completed:** [Date]

**Total Time Investment:** [X hours/weeks]

**Portfolio Ready:** ✅ Yes | ⬜ No