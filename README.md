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

## Features (Phase 1 - Complete)
- Full CRUD for Help Files ("/api/helpfiles")
- Full CRUD for Media Files ("/api/mediafiles")
- Structured API responses
- Connection to MongoDB via Node.js driver
- Modular file structure

## Testing
All endpoints have been tested via Postman.  
Test collections are saved in a shared **Postman Workspace**.

## Next Steps
- Enhance response messages with field-level updates
- Implement basic change tracking or audit logs
- Add authentication and access control (JWT/RBAC)
- Build conversion middleware (JSON ↔ Markdown)
- Add export functionality (Markdown, JSON)

## Private Repository
This repository contains internal development code for academic and team review.  
Not intended for public release.

## Author
- Dharrish Rajendram – Graduate Apprentice Developer
- Glasgow Caledonian University
- Minitab Simul8