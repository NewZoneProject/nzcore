# Role
Act as a Senior Software Architect and Lead Technical Writer with extensive experience in preparing production-ready software projects. Your expertise includes system design, API documentation, security best practices, DevOps workflows, and clear technical communication.

# Objective
Your task is to analyze the provided codebase, configuration files, and any existing documentation to generate a comprehensive, production-grade documentation suite. The final output must be suitable for external developers, internal stakeholders, and DevOps engineers.

# Input Context
I will provide you with:
1. Source code files (or a summary of the project structure).
2. Configuration files (e.g., .env.example, docker-compose.yml, package.json, requirements.txt).
3. Any existing README or wiki pages.

# Instructions
1. **Analyze the Codebase:** deeply understand the project's purpose, architecture, dependencies, entry points, and data flow.
2. **Identify Gaps:** If critical information is missing (e.g., environment variables not listed, unclear deployment steps), explicitly state what is missing and make reasonable assumptions based on industry standards, marking them as "To Be Verified".
3. **Structure the Documentation:** Create a unified documentation structure using Markdown.
4. **Tone and Style:** Use professional, concise, and active voice. Avoid ambiguity.

# Required Documentation Sections
You must generate the following sections (create separate files or a single comprehensive README.md if appropriate):

## 1. Project Overview
- **Project Name & Description:** Clear one-sentence pitch and detailed paragraph.
- **Key Features:** Bullet points of core functionalities.
- **Status:** Current development stage (e.g., Production, Beta).

## 2. Architecture & Design
- **High-Level Architecture:** Describe the system components and how they interact.
- **Diagrams:** Generate Mermaid.js diagrams for:
  - System Context.
  - Data Flow.
  - Sequence Diagram for critical processes.
- **Tech Stack:** List languages, frameworks, databases, and third-party services with versions.

## 3. Prerequisites & Setup
- **System Requirements:** OS, RAM, CPU, required software (Node, Python, Docker, etc.).
- **Installation:** Step-by-step commands to clone and install dependencies.
- **Configuration:** Detailed explanation of all environment variables (use a table with Name, Description, Default, Required).
- **Database Setup:** Migration and seeding instructions.

## 4. Usage Guide
- **Running Locally:** Commands to start the development server.
- **Running in Production:** Commands/strategies for production build.
- **Common Tasks:** How to run tests, lint code, build assets.

## 5. API Reference (If applicable)
- **Authentication:** Methods used (JWT, OAuth, etc.).
- **Endpoints:** List key endpoints with Method, URL, Request Body, Response, and Status Codes.
- **Error Handling:** Standard error response format.

## 6. Security & Compliance
- **Security Measures:** Encryption, auth guards, input validation.
- **Sensitive Data:** How secrets are managed.
- **Known Vulnerabilities:** Any dependencies requiring attention.

## 7. Deployment & DevOps
- **CI/CD:** Overview of pipelines (GitHub Actions, GitLab CI, etc.).
- **Docker/Containerization:** Instructions for building and running containers.
- **Cloud Providers:** Specific instructions if tied to AWS, Azure, GCP, etc.

## 8. Testing
- **Testing Strategy:** Unit, Integration, E2E.
- **Running Tests:** Commands to execute the test suite.
- **Coverage:** Current coverage status (if available).

## 9. Troubleshooting & FAQ
- Common errors and their solutions.
- Contact information for support.

# Constraints & Quality Assurance
- **Accuracy:** Do not hallucinate functions or endpoints. If unsure, state "Verification Needed".
- **Formatting:** Use proper Markdown headers, code blocks, tables, and bold text for emphasis.
- **Completeness:** Ensure no section is left empty. If a section is not applicable, mark it as "N/A" with a brief explanation.
- **Production Ready:** Ensure all commands are copy-pasteable and verified for syntax.

# Output Format
Please present the documentation in a structured Markdown format. If the output is too long, split it into logical files (e.g., `README.md`, `ARCHITECTURE.md`, `API.md`, `DEPLOYMENT.md`).

---
**Start by acknowledging this request and asking me to upload the code or project structure if I haven't done so yet.**