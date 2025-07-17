# Help Files Project - API


This is a private Node.js and Express.js API for managing **Help Files** and **Media Files** stored in **MongoDB Atlas**.

The project is part of an iterative Honours Project focused on developing a scalable, migration-proof back-end document management tool.

All endpoints have been tested using Postman, and test collections are available in a shared workspace.

This API is not yet public-facing and is intended for internal testing, research and use only.


## Tech Stack
- Node.js
- Express.js
- MongoDB Atlas
- Postman API for testing

## Features
### Phase 1 – Complete
- Full CRUD for Help Files ("/api/helpfiles")
- Full CRUD for Media Files ("/api/mediafiles")
- Structured API responses
- Connection to MongoDB via Node.js driver
- Modular file structure (controllers, routes, middleware)

### Phase 2 – Complete
- JWT-based authentication (Login, Logout, Protected Routes)
- Basic role-based access control (Admin, Editor)
- Input validation (express-validator)
- Search Help Files and Media Files by tag

### Phase 3 – Complete
- Markdown-to-HTML parsing using markdown-it
- /preview/:document_id endpoint for live HTML rendering
- Preprocessing support for search/display


### Phase 4 – Complete
- Export functionality (Markdown, JSON)
- Conversion middleware (Markdown ↔ JSON)
- Custom filter endpoints by tag and category
- Basic version control/audit logging for update/delete actions

### Final Phase – In Progress
- Atlas Search integration and indexing
- Error handling improvements

## Testing
All endpoints have been tested via Postman.  
Test collections are saved in a shared **Postman Workspace**.

## Comments
- Basic .txt file upload > JSON > MongoDB is implemented. Parsing is currently minimal and will be refined post-demo.
- Upload endpoint (/api/files/upload-txt) available via Postman — UI integration planned in future work.
- Bulk operations for editing and export is planned in final refinement.

## Private Repository
This repository contains internal development code for academic and team review.  
Not intended for public release.

## Author
- Dharrish Rajendram – Graduate Apprentice Developer
- Glasgow Caledonian University
- Minitab Simul8