# BOOMBRIDGE

## Website Sitemap Structure
Color codes: **High = MVP** | **Medium = Phase 2** | **Low = Future Development**

```mermaid
graph TB

%% =========================
%% BOOMBRIDGE Website Sitemap (priority-ordered + color-coded)
%% High = MVP (green) | Medium = Phase 2 (yellow) | Low = Future (blue)
%% =========================

A[Homepage]

%% --- MVP (High) ---
subgraph B[Dashboard — MVP 1]
  B1[User Profile]
  B2[Order Tracking]
  B3[Performance Report]
end

subgraph C[Products & RFQ — MVP 2]
  C1[Product Catalog]
  C2[Quotation Request]
  C3[Quotation Response]
end

subgraph E[Payments & Wallet — MVP 3]
  E1[Wallet Overview]
  E2[Transaction History]
  E3[Payment Options]
end

%% --- Phase 2 (Medium) ---
subgraph D[Suppliers — Phase 2]
  D1[Supplier List]
  D2[Supplier Details]
  D3[Ratings and Reviews]
end

subgraph L[Logistics — Phase 2]
  L1[Delivery Tracking]
  L2[Partner Integration]
end

subgraph G[Admin Dashboard — Phase 2]
  G1[User Management]
  G2[KPI Analytics]
end

%% --- Future (Low) ---
subgraph F[BIM Integration]
  F1[BIM Object Library]
  F2[Model Integration View]
end

subgraph H[AI Recommendations]
  H1[Recommended Suppliers]
  H2[Material Suggestions]
end

subgraph J[Contact & Support]
  J1[FAQ]
  J2[Contact Form]
  J3[Live Chat]
end

%% Top-level links from Homepage (kept light; subgraphs show containment)
A --- B
A --- C
A --- E
A --- D
A --- L
A --- G
A --- F
A --- H
A --- J

%% =========================
%% Color styles by priority
%% =========================
classDef high   fill:#b9f6ca,stroke:#2e7d32,stroke-width:1px,color:#000;
classDef medium fill:#fff59d,stroke:#f9a825,stroke-width:1px,color:#000;
classDef low    fill:#bbdefb,stroke:#1565c0,stroke-width:1px,color:#000;

%% Apply to section headers (and their inner nodes for broader effect)
class B,C,E high;
class D,L,G medium;
class F,H,J low;

class B1,B2,B3,C1,C2,C3,E1,E2,E3 high;
class D1,D2,D3,L1,L2,G1,G2 medium;
class F1,F2,H1,H2,J1,J2,J3 low;
```

---

## Development Timeline (12 Weeks Plan)  

| Week | Milestone | Description |
|:----:|------------|-------------|
| **1–2** | Requirement Gathering & System Design | Define user stories, database schema, and architecture. |
| **3–4** | UI/UX Mockups & Visual Design | Develop web layout and prototype user flows. |
| **5–7** | Backend Development | Build core logic, APIs, and database integration. |
| **8–9** | Frontend Development | Connect frontend with APIs, implement wallet and RFQ modules. |
| **10** | BIM Integration | Integrate external BIM storage APIs and data import features. |
| **11** | QA Testing & Feedback | Conduct internal testing, collect user feedback. |
| **12** | Deployment & Pilot Launch | Deploy MVP version and run pilot tests on real projects. |

---
