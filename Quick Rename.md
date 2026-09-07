# MASTER BUILD INSTRUCTION
# PROJECT: QUICK RENAME
# TYPE: Desktop-First Browser File Renaming Utility
# TARGET: Windows Laptop / Desktop Browser
# LANGUAGE: English for this instruction, Indonesian for UI
# DEVELOPMENT MODE: Production-ready, complete implementation

You are the lead software architect, senior full-stack developer, UI/UX designer, security engineer, QA engineer, and DevOps engineer.

Your task is to BUILD THE COMPLETE "QUICK RENAME" APPLICATION from the current VS Code workspace.

Do not merely create a prototype, mockup, placeholder, static UI, or incomplete feature.

The final project must be a fully functional production-ready application.

==================================================
1. PRODUCT IDENTITY
==================================================

Application Name:
Quick Rename

Category:
Bulk File Renaming Utility

Tagline:
Rename Hundreds of Files in Seconds.

Primary purpose:
Allow users to rename multiple files quickly and safely from a desktop browser.

The application is specifically optimized for:
- Windows laptop
- Windows desktop
- Chrome
- Microsoft Edge

Desktop-first is mandatory.

Do NOT design the application primarily for mobile.

The application should feel like a premium desktop utility rather than a typical SaaS dashboard.

==================================================
2. CORE PRODUCT PRINCIPLE
==================================================

The most important technical principle:

USER FILES MUST STAY ON THE USER'S DEVICE.

Do NOT upload user files to the application server.

Do NOT store user documents in cloud storage.

Do NOT send file contents to APIs.

Do NOT store PDFs, images, DOCX, XLSX, ZIP, or other user files on the backend.

The browser handles file operations locally.

The backend is ONLY responsible for:
- authentication
- user profile
- usage quota
- token balance
- token transactions
- payment orders
- payment verification status
- application configuration
- audit logs where appropriate

==================================================
3. IMPORTANT BROWSER FILE SYSTEM REQUIREMENT
==================================================

Use the File System Access API where supported.

Primary workflow:

User
→ Open Folder
→ Browser asks for permission
→ Application reads directory entries
→ User selects files
→ Rename preview
→ Validation
→ Rename directly inside selected folder

Do not use traditional upload as the primary workflow.

Support:
- directory selection
- file selection
- multi-selection
- drag and drop where technically appropriate

Target browsers:
- Google Chrome desktop
- Microsoft Edge desktop

Provide a graceful fallback for browsers that do not support the required File System Access API.

Fallback:
- Select multiple files
- Process locally
- Generate renamed ZIP
- User downloads the ZIP

Clearly communicate when fallback mode is being used.

==================================================
4. USER ACCESS / MONETIZATION
==================================================

There are exactly three usage levels.

LEVEL 1 — FREE

User does not need to log in.

Maximum:
5 files.

Example:
User selects 5 files
→ allowed.

User selects 6 files
→ blocked with upgrade prompt.

Free quota must NOT be trusted solely to localStorage.

Use server-side enforcement where an anonymous usage identifier can reasonably be maintained.

Prevent simple refresh-based quota reset.

However, do not require registration for the first 5 files.

------------------------------------------

LEVEL 2 — GOOGLE LOGIN

User signs in with Google.

Quota:
10 files.

This is an account-based quota.

Example:

10 files available
→ rename 4
→ remaining 6

If quota reaches zero:
show token purchase interface.

------------------------------------------

LEVEL 3 — TOKEN

Price:

1 Token = Rp50.000

1 Token provides:
100 successful file rename operations.

Example:

100 files
→ rename 25
→ remaining 75

Important:

Token is a FILE BALANCE, not a session count.

One successfully renamed file consumes exactly 1 unit.

If rename fails:
DO NOT consume quota.

If validation fails:
DO NOT consume quota.

If user cancels:
DO NOT consume quota.

If only 20 of 25 files are successfully renamed:
consume only 20.

==================================================
5. TOKEN RULES
==================================================

Token price:
Rp50.000

Token value:
100 files

No expiration by default.

Token belongs to the authenticated Google account.

Token balance must persist across:
- browser sessions
- different computers
- different browsers

Example:

User:
user@gmail.com

Token balance:
100

Rename:
20

Balance:
80

Do not expose sensitive backend implementation details to the client.

All token balance mutations must happen server-side.

Use transactional database operations to prevent race conditions.

==================================================
6. PAYMENT METHODS
==================================================

Supported payment methods:

1. DANA
2. QRIS

Initial implementation can use MANUAL PAYMENT VERIFICATION unless a payment gateway is explicitly configured.

Do NOT pretend that a payment was automatically verified if no payment gateway integration exists.

Payment workflow:

User clicks:
BUY TOKEN

→ Select:
DANA
or
QRIS

→ Create payment order

→ Display payment instructions

→ User completes payment

→ User submits payment confirmation / proof

→ Payment status:
PENDING

→ Admin verifies

→ Payment becomes:
PAID / APPROVED

→ System adds:
100 file units

to user's token balance.

Payment statuses:

PENDING
WAITING_VERIFICATION
APPROVED
REJECTED
EXPIRED
CANCELLED

==================================================
7. PAYMENT UI
==================================================

Create a premium purchase dialog.

Display:

QUICK RENAME

1 TOKEN

100 FILES

Rp50.000

Payment methods:

[DANA]
[QRIS]

For DANA:
show configurable payment destination from admin settings.

For QRIS:
show configurable QRIS image.

Do NOT hard-code personal payment information.

Create environment/configuration variables for payment details.

Example concept:

DANA_PAYMENT_NAME
DANA_PAYMENT_NUMBER
QRIS_IMAGE_URL

Do not expose secret server keys to the client.

==================================================
8. GOOGLE AUTHENTICATION
==================================================

Implement Google OAuth.

Users can:

- Sign in with Google
- Sign out
- See account information
- See quota
- See token balance
- See purchase history

Use secure authentication.

Never store Google passwords.

Never request Google credentials manually.

==================================================
9. DATABASE
==================================================

Create a proper relational database schema.

The implementation must use a production-ready database compatible with the chosen deployment architecture.

If the existing project already has a database architecture, inspect and reuse it if appropriate.

Recommended entities:

users
anonymous_sessions
usage_records
token_accounts
token_transactions
payment_orders
payment_proofs
admin_users
app_settings
rename_history

Suggested conceptual schema:

USERS
- id
- google_id
- email
- name
- avatar_url
- created_at
- updated_at
- last_login_at

ANONYMOUS_SESSIONS
- id
- session_hash
- free_quota
- used_files
- created_at
- updated_at

TOKEN_ACCOUNTS
- id
- user_id
- balance
- created_at
- updated_at

TOKEN_TRANSACTIONS
- id
- user_id
- type
- amount
- balance_before
- balance_after
- reference
- description
- created_at

PAYMENT_ORDERS
- id
- user_id
- order_number
- token_quantity
- file_quantity
- amount
- payment_method
- status
- created_at
- updated_at
- verified_at
- verified_by

PAYMENT_PROOFS
- id
- payment_order_id
- reference/path
- submitted_at

RENAME_HISTORY
- id
- user_id
- operation_id
- file_count
- created_at

Never store actual user file contents.

==================================================
10. FILE RENAME ENGINE
==================================================

Build a robust rename engine.

Supported operations:

1. Prefix
2. Suffix
3. Find & Replace
4. Numbering
5. Remove text
6. Case conversion
7. Pattern replacement
8. Date insertion
9. Time insertion
10. Extension preservation
11. Sorting before numbering

==================================================
11. PATTERN SYSTEM
==================================================

Support variables:

{name}
{n}
{nn}
{nnn}
{date}
{time}
{ext}

Examples:

{n}

Result:
1
2
3

{nnn}

Result:
001
002
003

Example:

PPPK_{n}

Result:

PPPK_001.pdf
PPPK_002.pdf
PPPK_003.pdf

Example:

Dokumen_{date}_{n}

Result:

Dokumen_2026-09-07_001.pdf

Extension must remain correct.

==================================================
12. NUMBERING OPTIONS
==================================================

Provide:

Start Number
Increment
Padding

Example:

Start:
100

Increment:
1

Padding:
3

Result:

100
101
102

Another example:

Start:
10

Increment:
5

Result:

010
015
020

==================================================
13. FIND & REPLACE
==================================================

Example:

Find:
IMG_

Replace:
PPPK_

Before:

IMG_001.pdf
IMG_002.pdf

After:

PPPK_001.pdf
PPPK_002.pdf

Support:
- case-sensitive
- case-insensitive

==================================================
14. PREFIX / SUFFIX
==================================================

Prefix example:

SK_

IMG_001.pdf

becomes:

SK_IMG_001.pdf

Suffix:

_Final

becomes:

IMG_001_Final.pdf

Always preserve extension.

==================================================
15. CASE CONVERSION
==================================================

Support:

UPPERCASE
lowercase
Title Case
Sentence Case

Example:

laporan sekolah.pdf

→

LAPORAN SEKOLAH.pdf

or:

Laporan Sekolah.pdf

==================================================
16. CHARACTER REMOVAL
==================================================

Allow users to remove selected characters or text.

Example:

Laporan (1).pdf
Laporan (2).pdf

Can become:

Laporan.pdf
Laporan.pdf

But before applying:
detect duplicates and warn user.

==================================================
17. SORTING
==================================================

Support sorting:

- Name A-Z
- Name Z-A
- File size
- Modified date
- Extension
- Original selection order

Numbering must follow the currently selected sorting mode.

==================================================
18. SEARCH & FILTER
==================================================

Provide file search.

Example:

Search:
.pdf

Only PDF files appear.

Filters:
- All files
- PDF
- Images
- Documents
- Spreadsheets
- Archives
- Other

==================================================
19. FILE LIST
==================================================

Desktop file list must display:

Checkbox
File icon
Filename
Extension/type
Size
Modified date
Status

Example:

☐ IMG_001.pdf
PDF
1.2 MB
Today

Use virtualized rendering for large lists.

The application should remain responsive with thousands of files where browser APIs permit.

==================================================
20. DRAG & DROP
==================================================

Support drag-and-drop.

Display a premium drop zone when no files are loaded.

Example:

Drop files here

or

[ Open Folder ]

After files are loaded, minimize the drop area so the file list remains dominant.

==================================================
21. LIVE PREVIEW
==================================================

Preview is mandatory before rename.

Display:

BEFORE
→
AFTER

Example:

IMG_001.pdf
→
PPPK_001.pdf

IMG_002.pdf
→
PPPK_002.pdf

Show status:

✓ Ready

⚠ Conflict

✕ Invalid

Do not allow rename when critical conflicts exist.

==================================================
22. DUPLICATE DETECTION
==================================================

Detect:

- duplicate generated filenames
- existing filenames
- invalid Windows characters
- empty filenames
- overly long names
- extension conflicts

Windows-invalid characters include:

< > : " / \ | ? *

Prevent unsafe rename operations.

==================================================
23. SMART CONFLICT HANDLING
==================================================

When conflict occurs:

Example:

PPPK_001.pdf already exists.

Offer:

[Cancel]
[Skip]
[Auto Resolve]

Auto Resolve may produce:

PPPK_001 (1).pdf

PPPK_001 (2).pdf

Do not overwrite existing files by default.

Overwrite must NEVER be the default.

If overwrite is technically unavailable through the browser API, explain that clearly.

==================================================
24. RENAME TRANSACTION SAFETY
==================================================

Renaming multiple files has to be handled carefully.

Create an operation ID.

Before execution:

validate all files.

Then perform rename operations.

Track:
- original name
- new name
- success
- failure

Do not falsely report all files as successful.

Display actual results.

==================================================
25. UNDO
==================================================

Implement:

Undo Last Rename

Example:

IMG_001.pdf
→
PPPK_001.pdf

Undo:

PPPK_001.pdf
→
IMG_001.pdf

Store only metadata required for undo.

Do not upload file contents.

Undo should be available for the current session and recent operations where browser permissions allow.

==================================================
26. RENAME HISTORY
==================================================

Create a history interface.

Example:

Today

25 files
PPPK_{n}

15 files
SK_{n}_2026

Yesterday

48 files
Dokumen_{n}

History must not store file contents.

==================================================
27. KEYBOARD SHORTCUTS
==================================================

Implement desktop shortcuts:

Ctrl + A
Select all

Ctrl + F
Search

F2
Rename / open rename interface

Ctrl + Z
Undo last rename where possible

Esc
Close modal

Enter
Confirm action

Shortcuts must not interfere with browser-native behavior unnecessarily.

==================================================
28. CONTEXT MENU
==================================================

Right-click selected files.

Menu:

Rename
Rename with Pattern
Find & Replace
Add Prefix
Add Suffix
Remove Text
Select
Select All

Do not attempt to override browser context menu globally unless necessary.

==================================================
29. MAIN UI DESIGN
==================================================

The UI must look like a premium desktop utility.

Design direction:

Windows 11
+
Fluent Design
+
Soft 3D
+
Premium Utility Software

NOT:
- old-fashioned file manager
- generic admin dashboard
- colorful SaaS dashboard
- excessive gradients
- excessive glassmorphism

==================================================
30. COLOR SYSTEM
==================================================

Primary theme:

Dark charcoal.

Suggested:

Background:
#0F1117

Panel:
#171A21

Card:
#1D212B

Primary:
Electric Blue / Indigo

Text:
Soft White

Secondary text:
Cool Gray

Success:
Green

Warning:
Orange

Error:
Red

Use CSS variables/design tokens.

Do not scatter raw colors throughout the project.

==================================================
31. LIGHT MODE
==================================================

Provide Light Mode.

Background:
#F5F7FA

Panels:
#FFFFFF

Text:
Dark Gray

Primary:
Electric Blue / Indigo

The interface must remain visually consistent between themes.

==================================================
32. PREMIUM LOGO
==================================================

Brand:

QUICK RENAME

Logo concept:

A premium 3D document/file icon combined with circular rename arrows and a subtle lightning symbol.

Visual characteristics:

- soft 3D
- beveled edges
- subtle depth
- soft shadow
- metallic/white document
- electric blue/indigo rename arrows
- small lightning accent

Avoid cartoon style.

Avoid excessive realism.

It should look like a premium software application icon.

Create:
- logo
- icon
- favicon
- monochrome fallback
- dark mode version
- light mode version

If image assets cannot be generated automatically, create clean SVG-based equivalents.

==================================================
33. FAVICON
==================================================

Favicon must use icon only.

Do NOT use the complete "Quick Rename" text.

At 16x16 and 32x32 it must remain recognizable.

Preferred concept:

document
+
rename arrows
+
small lightning accent

==================================================
34. APPLICATION LAYOUT
==================================================

Desktop layout:

TOP BAR
- logo
- application name
- account status
- quota
- theme toggle
- settings

MENU BAR
- File
- Rename
- Tools
- View
- Help

LEFT PANEL
- Quick Access
- Recent
- Documents
- Downloads
- Desktop
- Favorites where technically possible

MAIN PANEL
- current folder
- search
- sorting
- file list

BOTTOM / SIDE RENAME PANEL
- pattern
- numbering
- prefix
- suffix
- find & replace
- advanced options
- preview
- rename action

==================================================
35. QUOTA UI
==================================================

Always show current quota.

Anonymous:

FREE
5 files remaining

Google:

GOOGLE
10 files remaining

Token:

TOKEN
87 files remaining

Use a compact premium status badge.

Do not make the quota interface visually aggressive.

==================================================
36. QUOTA ENFORCEMENT
==================================================

Before rename:

Calculate selected file count.

Calculate available quota.

If:

selected <= available

allow.

If:

selected > available

block.

Example:

Available:
5

Selected:
8

Display:

You selected 8 files, but only 5 files are available in your current quota.

Options:

[Remove 3 Files]
[Login with Google]
[Buy Token]

Do not consume quota until successful rename execution.

==================================================
37. FREE USER EXPERIENCE
==================================================

No registration required.

Landing screen:

QUICK RENAME

Rename hundreds of files in seconds.

[ Open Folder ]

Display:

Free usage:
5 files

After first successful rename:
update usage.

When 5 are consumed:
show upgrade prompt.

==================================================
38. GOOGLE USER EXPERIENCE
==================================================

Login button:

Continue with Google

After login:

Show:
- avatar
- name
- email
- remaining quota
- token balance
- purchase history
- logout

Google users get:
10 files.

==================================================
39. PURCHASE EXPERIENCE
==================================================

Create:

Buy Token

Card:

1 TOKEN
100 FILES
Rp50.000

Buttons:

[DANA]
[QRIS]

Use a clean payment modal/page.

==================================================
40. PAYMENT ADMIN
==================================================

Create an admin area.

Admin can:

- view payment orders
- view user
- view order number
- view payment method
- view amount
- view proof
- approve
- reject
- add token
- view transaction history

When approved:

Add exactly:

100 file units.

Create a token transaction record.

Use database transaction.

Prevent double approval from adding tokens twice.

==================================================
41. ADMIN SECURITY
==================================================

Do not rely only on a hidden frontend route.

Admin authorization must be server-side.

Use:
- admin role
- protected API/server actions
- secure session verification

Never expose service-role database credentials to browser code.

==================================================
42. PAYMENT PROOF
==================================================

If manual verification is used, allow the user to submit payment proof.

Do not require sensitive documents.

Only payment-related proof should be accepted.

Use secure storage if proof storage is necessary.

Do not expose payment proof publicly.

==================================================
43. CONFIGURATION
==================================================

Create environment variables.

Never hard-code:

- OAuth secrets
- database credentials
- admin secrets
- payment secrets

Use:

.env.local

and create:

.env.example

with placeholders only.

==================================================
44. SECURITY
==================================================

Implement:

- server-side authorization
- server-side quota enforcement
- input validation
- rate limiting where appropriate
- CSRF protection where applicable
- secure cookies
- secure OAuth flow
- database transactions
- idempotency for payment approval
- audit logging for administrative actions

Never trust client-supplied:
- quota
- token balance
- payment status
- user role
- admin role

==================================================
45. PRIVACY
==================================================

Display a privacy message:

"Your files stay on your device. Quick Rename does not upload or store your files."

Make this visible but unobtrusive.

==================================================
46. ERROR HANDLING
==================================================

Create polished error states.

Examples:

Browser does not support folder access.

Permission denied.

Folder unavailable.

File cannot be renamed.

Filename conflict.

Invalid filename.

Quota exceeded.

Authentication failed.

Payment pending.

Payment rejected.

Network unavailable.

Each error should have:
- understandable message
- suggested action
- retry where appropriate

Do not display raw stack traces to users.

==================================================
47. LOADING STATES
==================================================

Use:
- skeletons
- progress indicators
- subtle animations

During rename:

Renaming files...

23 / 100

Progress:
████████░░░░░░

Do not freeze the interface.

==================================================
48. SUCCESS STATES
==================================================

After successful rename:

✓ Rename Complete

25 files renamed successfully.

Quota remaining:
75

Provide:

[Done]
[View History]

==================================================
49. RESPONSIVENESS
==================================================

Desktop-first.

Primary target:
1366x768
1440x900
1920x1080

Support smaller laptop screens.

Mobile is NOT a primary target.

Do not sacrifice desktop usability for mobile responsiveness.

However, avoid broken layout if browser window is narrow.

==================================================
50. ACCESSIBILITY
==================================================

Implement:

- keyboard navigation
- visible focus states
- proper labels
- semantic buttons
- ARIA where appropriate
- sufficient contrast
- reduced motion preference

==================================================
51. PERFORMANCE
==================================================

Application must remain responsive.

Optimize:
- file list rendering
- virtual scrolling
- rename preview calculation
- state updates
- unnecessary re-renders

Do not read entire file contents just to rename them.

Only metadata is required.

==================================================
52. ARCHITECTURE
==================================================

Before implementing:

1. Inspect the existing repository.
2. Determine current framework.
3. Determine existing dependencies.
4. Determine whether an existing app is already present.
5. Reuse useful existing components where appropriate.
6. Do not blindly overwrite working code.
7. If project is empty, initialize the best architecture.

Preferred stack if no existing architecture is present:

Next.js
TypeScript
Tailwind CSS
Modern component architecture
Server-side authentication
Relational database
File System Access API
Zod or equivalent validation
Lucide icons

Use a stable production-ready architecture.

==================================================
53. PROJECT STRUCTURE
==================================================

Organize code logically.

Example:

app/
components/
lib/
hooks/
services/
types/
utils/
styles/
public/
database/
tests/

Separate:

UI
file engine
quota engine
authentication
payments
database
admin
validation

Do not create one giant component.

==================================================
54. FILE RENAME ENGINE SEPARATION
==================================================

The rename engine must be reusable and independently testable.

Create functions for:

generateNewName()
applyPattern()
applyPrefix()
applySuffix()
findReplace()
formatNumber()
validateFilename()
detectDuplicateNames()
sortFiles()
calculateQuotaUsage()
executeRename()
undoRename()

Do not mix these heavily with React UI code.

==================================================
55. TESTING
==================================================

Create automated tests for:

Pattern generation
Numbering
Padding
Prefix
Suffix
Find & Replace
Case conversion
Duplicate detection
Invalid Windows characters
Quota calculations
Token calculations
Successful rename
Failed rename
Partial rename
Undo

Test examples:

Input:
IMG_001.pdf

Pattern:
PPPK_{n}

Expected:
PPPK_001.pdf

Input:
laporan sekolah.pdf

Uppercase:

LAPORAN SEKOLAH.pdf

==================================================
56. DATABASE TESTING
==================================================

Test:

Free quota:
5

Google quota:
10

Token:
100

After 25 successful token renames:
75

After failed rename:
balance unchanged

Payment approved once:
+100

Payment approved twice:
still +100 only

Payment rejected:
+0

==================================================
57. UX TESTING
==================================================

Verify:

- user understands where to open folder
- user understands selected files
- user sees before/after names
- user understands quota
- user can cancel rename
- user understands payment status
- user can find token balance

Avoid unnecessary dialogs.

==================================================
58. NO FAKE FEATURES
==================================================

Never create buttons that do nothing.

Never create:
- fake payment verification
- fake Google login
- fake token balance
- fake rename result
- fake file processing

If a third-party service is not configured:
show a clear setup state and document configuration.

==================================================
59. README
==================================================

Create a comprehensive README.md.

Include:

Project overview
Features
Architecture
Installation
Environment variables
Google OAuth setup
Database setup
Admin setup
DANA configuration
QRIS configuration
Development
Testing
Production build
Deployment
Vercel deployment
Browser requirements
File System Access API explanation
Privacy model
Quota system
Token system
Payment workflow
Troubleshooting

==================================================
60. DEPLOYMENT
==================================================

The application should be deployment-ready for Vercel or another compatible production platform.

Before declaring complete:

Run:

npm install
npm run lint
npm run typecheck
npm run test
npm run build

Fix all errors.

Do not finish with known build errors.

==================================================
61. SEO / LANDING
==================================================

Create a simple landing/entry experience.

Title:

Quick Rename — Bulk File Renamer

Description:

Rename multiple files quickly and safely directly from your browser.

Highlight:

Your files stay on your device.

Primary CTA:

Open Folder

Secondary:

Continue with Google

==================================================
62. LEGAL / PRIVACY
==================================================

Create:
- Privacy Policy
- Terms of Service

Keep them concise and relevant.

Important privacy statement:

User files are processed locally whenever possible and are not uploaded to Quick Rename servers.

Do not make unsupported legal claims.

==================================================
63. FINAL USER FLOW
==================================================

FLOW A:

Open Quick Rename

↓

Free user

↓

Open Folder

↓

Select files

↓

Maximum 5 files

↓

Configure rename

↓

Preview

↓

Validate

↓

Rename

↓

Success

↓

Quota updated

------------------------------------------

FLOW B:

Free quota exhausted

↓

Login with Google

↓

Google quota:
10 files

↓

Rename

↓

Quota exhausted

↓

Buy Token

------------------------------------------

FLOW C:

Buy Token

↓

1 Token

↓

Rp50.000

↓

DANA or QRIS

↓

Payment order created

↓

Payment submitted

↓

Admin verification

↓

Approved

↓

100 file units added

↓

User can continue renaming

==================================================
64. IMPORTANT QUOTA LOGIC
==================================================

Priority order:

If authenticated user has remaining Google quota:
use Google quota first.

After Google quota reaches zero:
use token balance if available.

If token balance is available:
consume token units.

If no quota:
block operation.

However, design the database so quota sources remain separately auditable.

Never silently mix balances.

==================================================
65. TOKEN DISPLAY
==================================================

Example:

Google quota:
0 / 10

Token balance:
75 / 100

Overall available:
75 files

Use clear labels.

Do not make users confused about whether they are consuming free quota or purchased token.

==================================================
66. DESIGN DETAILS
==================================================

Use:
- rounded corners
- subtle shadows
- thin borders
- premium spacing
- smooth hover states
- subtle animations
- modern typography
- professional icons

Avoid:
- excessive gradients
- excessive cards
- huge empty spaces
- childish illustrations
- excessive glass effects
- excessive neon

==================================================
67. APPLICATION ICON
==================================================

Use the Quick Rename visual identity:

Document
+
Rename arrows
+
Lightning

Create SVG versions where practical.

The logo must look good at:
16px
32px
48px
128px
256px
512px

==================================================
68. SETTINGS
==================================================

Create settings:

Appearance:
- Dark
- Light
- System

File behavior:
- Preserve extensions
- Confirm before rename
- Auto resolve conflicts

View:
- Compact
- Comfortable

Keyboard shortcuts reference.

==================================================
69. HELP
==================================================

Create Help dialog/page explaining:

How to open a folder
How to select files
How to create a pattern
How numbering works
How Find & Replace works
How quota works
How Token works
How payment works
Browser compatibility

==================================================
70. IMPLEMENTATION ORDER
==================================================

Do NOT attempt to write everything randomly.

Implement in this order:

PHASE 1
Project audit and architecture.

PHASE 2
UI shell and design system.

PHASE 3
File System Access API.

PHASE 4
File list and selection.

PHASE 5
Rename engine.

PHASE 6
Preview and validation.

PHASE 7
Actual rename execution.

PHASE 8
Undo and history.

PHASE 9
Authentication.

PHASE 10
Quota system.

PHASE 11
Token system.

PHASE 12
Payment orders.

PHASE 13
Admin verification.

PHASE 14
Testing.

PHASE 15
Security review.

PHASE 16
Performance optimization.

PHASE 17
Production build.

PHASE 18
README and deployment documentation.

==================================================
71. AI CODING BEHAVIOR
==================================================

You are expected to actually modify/create files in the workspace.

Do not only explain what should be done.

Do not stop after creating a plan.

Do not ask me to manually implement obvious parts.

When encountering an error:
- diagnose
- fix
- rerun validation
- continue

When a dependency is required:
install it if appropriate.

When a configuration is required:
create .env.example and document it.

When an external credential is required:
create the integration structure but never invent credentials.

==================================================
72. EXISTING PROJECT SAFETY
==================================================

Before modifying files:

Inspect:
package.json
src/
app/
pages/
components/
lib/
public/
database/
README.md
environment files
configuration files

If an existing project is detected:
preserve valuable existing functionality unless it conflicts with this specification.

If the existing project is clearly an unfinished Quick Rename project:
continue and improve it instead of rebuilding blindly.

==================================================
73. FINAL QUALITY GATE
==================================================

Before saying "DONE", verify all of the following:

[ ] Application starts
[ ] No TypeScript errors
[ ] No lint errors
[ ] Production build succeeds
[ ] Main UI works
[ ] Folder access works
[ ] File selection works
[ ] Multi-selection works
[ ] Rename preview works
[ ] Pattern engine works
[ ] Numbering works
[ ] Prefix works
[ ] Suffix works
[ ] Find & Replace works
[ ] Validation works
[ ] Duplicate detection works
[ ] Rename works
[ ] Undo works where supported
[ ] History works
[ ] Free quota works
[ ] Google authentication works
[ ] Google quota works
[ ] Token balance works
[ ] Token deduction works
[ ] Failed rename does not consume quota
[ ] Payment order works
[ ] DANA option works
[ ] QRIS option works
[ ] Admin verification works
[ ] Double payment approval is prevented
[ ] Token is added exactly once
[ ] Admin authorization is secure
[ ] No user file is uploaded
[ ] Privacy messaging exists
[ ] Dark mode works
[ ] Light mode works
[ ] Favicon exists
[ ] Logo exists
[ ] README exists
[ ] .env.example exists
[ ] Production build succeeds

==================================================
74. FINAL RESPONSE FORMAT
==================================================

After implementation, report:

1. What was built.
2. Important files created/modified.
3. Features completed.
4. Database schema.
5. Authentication setup required.
6. Payment setup required.
7. Environment variables required.
8. Test results.
9. Build result.
10. Remaining manual configuration, if any.

Do not claim something is completed if it has not actually been implemented.

==================================================
FINAL COMMAND
==================================================

START NOW.

First inspect the current workspace.

Then create an implementation plan internally.

Then implement the project phase by phase.

Do not stop at the planning stage.

Build Quick Rename completely and make it production-ready.