# AI-Powered RFP Management Platform

An intelligent procurement platform that automates Request for Proposal (RFP) creation, vendor matching, email distribution, and proposal evaluation using AI.

---

## 📋 Table of Contents

1. [Project Setup](#project-setup)
2. [Tech Stack](#tech-stack)
3. [API Documentation](#api-documentation)
4. [Decisions & Assumptions](#decisions--assumptions)
5. [AI Tools Usage](#ai-tools-usage)

---

## 🚀 Project Setup

### Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js**: v18.x or higher
- **MongoDB**: v6.0 or higher (local or MongoDB Atlas)
- **npm**: v9.x or higher
- **API Keys Required**:
  - OpenAI API Key (for AI parsing and analysis)
  - Gmail API credentials (for email receiving)
  - Brevo API Key (for email sending) OR Gmail SMTP credentials
  - Google Cloud Pub/Sub credentials (for real-time email notifications)

### Installation Steps

#### **Backend Setup**

1. **Clone the repository**
   ```bash
   cd "aerctin project/BE"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file in the BE directory**
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/aerctin
   # OR for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aerctin

   # Server
   PORT=3000
   NODE_ENV=development

   # OpenAI
   OPENAI_API_KEY=sk-...your-openai-key...

   # Email Service Provider (Choose one)
   EMAIL_PROVIDER=brevo
   # For Brevo:
   BREVO_API_KEY=xkeysib-...your-brevo-key...
   BREVO_SENDER_EMAIL=your-verified-email@domain.com
   BREVO_SENDER_NAME=Your Company Name

   # OR for Gmail SMTP:
   # EMAIL_PROVIDER=gmail
   # GMAIL_USER=your-email@gmail.com
   # GMAIL_APP_PASSWORD=your-16-char-app-password

   # Gmail API (for receiving emails)
   GMAIL_CLIENT_ID=...your-client-id...
   GMAIL_CLIENT_SECRET=...your-client-secret...
   GMAIL_REDIRECT_URI=http://localhost:3000/auth/google/callback
   GMAIL_REFRESH_TOKEN=...your-refresh-token...

   # Google Cloud Pub/Sub (for real-time notifications)
   GMAIL_PUBSUB_TOPIC=projects/your-project/topics/gmail-push
   GOOGLE_APPLICATION_CREDENTIALS=./config/google-credentials.json
   ```

4. **Set up Google Cloud Pub/Sub** (Optional but recommended for real-time updates)
   - Create a Google Cloud project
   - Enable Gmail API and Pub/Sub API
   - Create a Pub/Sub topic for Gmail notifications
   - Download service account credentials and place in `./config/google-credentials.json`
   - Register webhook URL with Gmail: `https://your-domain.com/api/proposals/gmail-webhook`

5. **Start MongoDB**
   ```bash
   # If using local MongoDB:
   mongod

   # If using MongoDB Atlas, ensure your IP is whitelisted
   ```

6. **Run the backend server**
   ```bash
   # Development mode (with nodemon)
   npm run dev

   # Production mode
   npm start
   ```

   Server will start on `http://localhost:3000`

#### **Frontend Setup**

1. **Navigate to frontend directory**
   ```bash
   cd "../FE"  # or wherever your frontend is located
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file in the FE directory**
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_SOCKET_URL=http://localhost:3000
   ```

4. **Run the frontend**
   ```bash
   npm run dev
   ```

   Frontend will start on `http://localhost:5173`

### Email Configuration

#### **Sending Emails (Brevo - Recommended)**

1. Sign up at [Brevo](https://www.brevo.com)
2. Verify your sender email
3. Get API key from Settings → SMTP & API → API Keys
4. Add to `.env`:
   ```env
   EMAIL_PROVIDER=brevo
   BREVO_API_KEY=your-key
   BREVO_SENDER_EMAIL=verified@email.com
   ```

#### **Sending Emails (Gmail SMTP - Alternative)**

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: Google Account → Security → App passwords
3. Add to `.env`:
   ```env
   EMAIL_PROVIDER=gmail
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx
   ```

#### **Receiving Emails (Gmail API)**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/auth/google/callback` as redirect URI
6. Download credentials and extract:
   - Client ID
   - Client Secret
7. Run OAuth flow to get refresh token (use [OAuth Playground](https://developers.google.com/oauthplayground))
8. Add credentials to `.env`

#### **Real-Time Email Notifications (Gmail Pub/Sub)**

1. In Google Cloud Console, enable Cloud Pub/Sub API
2. Create a topic: `projects/YOUR_PROJECT_ID/topics/gmail-push`
3. Grant Gmail permission to publish:
   ```bash
   gcloud pubsub topics add-iam-policy-binding gmail-push \
     --member=serviceAccount:gmail-api-push@system.gserviceaccount.com \
     --role=roles/pubsub.publisher
   ```
4. Create a push subscription pointing to your webhook URL
5. Register with Gmail watch:
   ```bash
   POST https://gmail.googleapis.com/gmail/v1/users/me/watch
   {
     "topicName": "projects/YOUR_PROJECT_ID/topics/gmail-push"
   }
   ```

### Running Everything Locally

1. **Start MongoDB** (if local)
   ```bash
   mongod
   ```

2. **Start Backend** (Terminal 1)
   ```bash
   cd "aerctin project/BE"
   npm run dev
   ```

3. **Start Frontend** (Terminal 2)
   ```bash
   cd "aerctin project/FE"
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Health Check: http://localhost:3000/health

### Seed Data / Initial Scripts

**Option 1: Add vendors manually via API**
```bash
POST http://localhost:3000/api/vendors
Content-Type: application/json

{
  "name": "TechSupply Inc",
  "email": "vendor@techsupply.com",
  "category": "Hardware",
  "description": "Leading provider of laptops and computer hardware"
}
```

**Option 2: Use MongoDB seed script**
```javascript
// Run in MongoDB shell or Compass
use aerctin;

db.vendors.insertMany([
  {
    name: "TechSupply Inc",
    email: "vendor1@techsupply.com",
    category: "Hardware",
    description: "Computer hardware supplier"
  },
  {
    name: "SoftwarePro LLC",
    email: "vendor2@softwarepro.com",
    category: "Software",
    description: "Enterprise software licenses"
  },
  {
    name: "OfficeEssentials",
    email: "vendor3@officeessentials.com",
    category: "Office Supplies",
    description: "Office furniture and supplies"
  }
]);
```

---

## 🛠 Tech Stack

### **Frontend**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Real-time**: Socket.io Client
- **HTTP Client**: Axios

### **Backend**
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Language**: JavaScript (ES6+)
- **Real-time**: Socket.io Server
- **Validation**: Express Validator (implicit)

### **Database**
- **Primary Database**: MongoDB v6.0
- **ODM**: Mongoose 8.x
- **Schema Design**: Normalized with references (RFP → Vendor, Proposal → RFP/Vendor)

### **AI & ML**
- **AI Provider**: OpenAI GPT-3.5 Turbo
- **Use Cases**:
  - Natural language RFP parsing
  - Email content extraction
  - Compliance analysis and comparison
- **Library**: `openai` npm package (v4.x)

### **Email Solutions**

**Sending**:
- **Primary**: Brevo (formerly Sendinblue) - Transactional email API
- **Alternative**: Gmail SMTP
- **Library**: `@getbrevo/brevo` SDK

**Receiving**:
- **Gmail API**: For fetching vendor responses
- **Google Cloud Pub/Sub**: Real-time push notifications
- **Libraries**: `googleapis`, `@google-cloud/pubsub`

### **Key Libraries**
- **dotenv**: Environment configuration
- **cors**: Cross-origin resource sharing
- **nodemon**: Development auto-reload
- **socket.io**: WebSocket communication
- **mongoose**: MongoDB object modeling

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

---

### **RFP Endpoints**

#### 1. Parse RFP Description
**Create an RFP from natural language description**

- **Method**: `POST`
- **Path**: `/rfps/parse`
- **Request Body**:
  ```json
  {
    "description": "I need 20 laptops with 16GB RAM and Intel i7 processor. Budget is $50,000. Need delivery in 2 weeks."
  }
  ```
- **Success Response** (201):
  ```json
  {
    "message": "RFP created successfully",
    "rfpId": "6968992afa0f3e8c7d9d675f",
    "data": {
      "_id": "6968992afa0f3e8c7d9d675f",
      "originalDescription": "I need 20 laptops...",
      "structuredData": {
        "items": [
          {
            "name": "Laptops",
            "specs": "16GB RAM, Intel i7 processor",
            "quantity": 20
          }
        ],
        "budget": 50000,
        "deadline": "2026-01-30T00:00:00.000Z",
        "category": "Hardware"
      },
      "status": "draft"
    },
    "vendors": [...],
    "vendorsCount": 5
  }
  ```
- **Error Response** (400):
  ```json
  {
    "error": "Description is required and must be a non-empty string"
  }
  ```
- **Error Response** (503):
  ```json
  {
    "error": "AI service unavailable. Please try again later."
  }
  ```

---

#### 2. Save RFP as Draft
**Save RFP with selected vendors without sending emails**

- **Method**: `POST`
- **Path**: `/rfps/:id/draft`
- **Request Body**:
  ```json
  {
    "vendorIds": ["vendor_id_1", "vendor_id_2", "vendor_id_3"]
  }
  ```
- **Success Response** (200):
  ```json
  {
    "message": "Draft saved successfully",
    "data": {
      "_id": "rfp_id",
      "status": "draft",
      "selectedVendors": ["vendor_id_1", "vendor_id_2"],
      "structuredData": {...}
    }
  }
  ```
- **Error Response** (404):
  ```json
  {
    "error": "RFP not found"
  }
  ```

---

#### 3. Get All Drafts
**Retrieve all RFPs with draft status**

- **Method**: `GET`
- **Path**: `/rfps/drafts`
- **Success Response** (200):
  ```json
  {
    "message": "Drafts retrieved successfully",
    "data": [
      {
        "_id": "rfp_id",
        "originalDescription": "...",
        "selectedVendors": [
          {
            "_id": "vendor_id",
            "name": "TechSupply Inc",
            "email": "vendor@techsupply.com",
            "category": "Hardware"
          }
        ],
        "status": "draft",
        "createdAt": "2026-01-15T..."
      }
    ],
    "count": 3
  }
  ```

---

#### 4. Dispatch RFP to Vendors
**Send RFP emails to selected vendors**

- **Method**: `POST`
- **Path**: `/rfps/:id/dispatch`
- **Request Body**:
  ```json
  {
    "vendorIds": ["vendor_id_1", "vendor_id_2"]
  }
  ```
- **Success Response** (200):
  ```json
  {
    "message": "RFP dispatch completed",
    "successful": 2,
    "failed": 0,
    "rfpStatus": "published",
    "sentToVendors": ["vendor_id_1", "vendor_id_2"],
    "results": [
      {
        "vendorId": "vendor_id_1",
        "vendorName": "TechSupply Inc",
        "email": "vendor@techsupply.com",
        "status": "SENT"
      }
    ],
    "errors": []
  }
  ```
- **Error Response** (400):
  ```json
  {
    "error": "vendorIds is required and must be a non-empty array"
  }
  ```

---

#### 5. Get Active RFPs
**Retrieve all published RFPs with response statistics**

- **Method**: `GET`
- **Path**: `/rfps/active`
- **Success Response** (200):
  ```json
  {
    "message": "Active RFPs retrieved successfully",
    "data": [
      {
        "_id": "rfp_id",
        "originalDescription": "...",
        "structuredData": {...},
        "status": "published",
        "responseStats": {
          "totalResponses": 3,
          "totalVendorsContacted": 5,
          "pendingResponses": 2,
          "responseRate": 60
        }
      }
    ],
    "count": 10
  }
  ```

---

#### 6. Delete Draft
**Delete an RFP in draft status**

- **Method**: `DELETE`
- **Path**: `/rfps/:id`
- **Success Response** (200):
  ```json
  {
    "message": "Draft deleted successfully"
  }
  ```
- **Error Response** (400):
  ```json
  {
    "error": "Only draft RFPs can be deleted"
  }
  ```

---

### **Proposal Endpoints**

#### 7. Get Proposals for RFP
**Get all vendor proposals for a specific RFP with AI compliance analysis**

- **Method**: `GET`
- **Path**: `/proposals/rfp/:rfpId`
- **Success Response** (200):
  ```json
  {
    "message": "Proposals retrieved successfully",
    "data": [
      {
        "_id": "proposal_id",
        "rfpId": "rfp_id",
        "vendorId": {
          "_id": "vendor_id",
          "name": "TechSupply Inc",
          "email": "vendor@techsupply.com",
          "category": "Hardware"
        },
        "extractedData": {
          "totalPrice": 48000,
          "deliveryDate": "2026-01-28T00:00:00.000Z",
          "warrantyProvided": "2 years comprehensive",
          "notes": "Bulk discount applied"
        },
        "complianceStatus": {
          "fulfilled": true,
          "reasons": [
            "Price within budget ($48,000 < $50,000)",
            "Delivery meets deadline",
            "Warranty provided"
          ],
          "summary": "Vendor meets all requirements"
        },
        "receivedAt": "2026-01-16T10:30:00.000Z"
      }
    ],
    "count": 3
  }
  ```
- **Error Response** (404):
  ```json
  {
    "error": "RFP not found"
  }
  ```

---

#### 8. Update RFP Status
**Update RFP status and get updated proposals with compliance**

- **Method**: `PATCH`
- **Path**: `/proposals/rfp/:rfpId`
- **Request Body**:
  ```json
  {
    "status": "completed"
  }
  ```
  *Note: "completed" is mapped to "closed" internally*

- **Success Response** (200):
  ```json
  {
    "message": "RFP status updated successfully",
    "rfp": {
      "_id": "rfp_id",
      "status": "closed",
      "originalDescription": "...",
      "structuredData": {...}
    },
    "proposals": [...],
    "proposalsCount": 5
  }
  ```
- **Error Response** (400):
  ```json
  {
    "error": "Invalid status. Must be one of: draft, published, closed, completed"
  }
  ```

---

#### 9. Submit Proposal Manually
**Manually add a vendor proposal (for testing)**

- **Method**: `POST`
- **Path**: `/proposals/manual`
- **Request Body**:
  ```json
  {
    "rfpId": "rfp_id",
    "vendorId": "vendor_id",
    "emailBody": "We can provide 20 laptops for $48,000. Delivery in 10 days. 2-year warranty included."
  }
  ```
- **Success Response** (201):
  ```json
  {
    "message": "Proposal submitted successfully",
    "data": {
      "_id": "proposal_id",
      "rfpId": "rfp_id",
      "vendorId": {...},
      "extractedData": {
        "totalPrice": 48000,
        "deliveryDate": "2026-01-26T00:00:00.000Z",
        "warrantyProvided": "2 years"
      }
    }
  }
  ```

---

#### 10. Gmail Webhook (Real-time Email Notifications)
**Receives push notifications from Gmail when vendors reply**

- **Method**: `POST`
- **Path**: `/proposals/gmail-webhook`
- **Request Body**: (Sent by Google Cloud Pub/Sub)
  ```json
  {
    "message": {
      "data": "base64-encoded-data",
      "messageId": "...",
      "publishTime": "..."
    }
  }
  ```
- **Success Response** (200):
  ```
  OK
  ```
- **Note**: This endpoint is called automatically by Google Cloud Pub/Sub. It processes emails asynchronously and broadcasts updates via Socket.io.

---

### **Vendor Endpoints**

#### 11. Get All Vendors
- **Method**: `GET`
- **Path**: `/vendors`
- **Success Response** (200):
  ```json
  {
    "message": "Vendors retrieved successfully",
    "data": [...],
    "count": 15
  }
  ```

#### 12. Create Vendor
- **Method**: `POST`
- **Path**: `/vendors`
- **Request Body**:
  ```json
  {
    "name": "TechSupply Inc",
    "email": "vendor@techsupply.com",
    "category": "Hardware",
    "description": "Leading hardware provider"
  }
  ```

---

## 🧠 Decisions & Assumptions

### Key Design Decisions

#### 1. **Database Schema Design**

**Decision**: Used a normalized schema with references instead of embedded documents.

**Models**:
- **RFP**: Stores original description, AI-parsed structured data, and status (draft/published/closed)
- **Vendor**: Stores vendor details and category for matching
- **Proposal**: Links RFP and Vendor, stores extracted data and compliance status

**Why**:
- Allows querying proposals independently
- Prevents data duplication
- Easier to update vendor info without affecting past proposals
- Supports real-time updates via Socket.io (emit specific proposal updates)

**Trade-off**: Requires population (joins) but worth it for data integrity.

---

#### 2. **AI Integration Strategy**

**Decision**: Use OpenAI GPT-3.5 Turbo for three separate AI tasks instead of one complex prompt.

**Tasks**:
1. **RFP Parsing** (`parseRFPDescription`): Natural language → Structured data
2. **Proposal Parsing** (`parseProposalEmail`): Email text → Extracted fields
3. **Compliance Analysis** (`compareProposalToRFP`): RFP requirements vs Proposal → Match evaluation

**Why**:
- Separation of concerns (single responsibility)
- Easier to debug and test each AI function
- More consistent results with focused prompts
- Can swap AI providers for specific tasks if needed

**Prompt Engineering**:
- Used `response_format: { type: 'json_object' }` for structured outputs
- Low temperature (0.2-0.3) for consistency
- Explicit field requirements in system prompts

---

#### 3. **Email Architecture**

**Decision**: Separate sending (Brevo) and receiving (Gmail API) providers.

**Why**:
- **Brevo for sending**: Professional transactional emails, high deliverability, analytics
- **Gmail API for receiving**: Real-time push notifications via Pub/Sub, easier OAuth, free tier
- Decoupled architecture allows swapping providers without major refactoring

**Alternative considered**: Using Gmail for both (rejected due to sending limits and complexity)

---

#### 4. **Real-Time Updates**

**Decision**: Gmail Pub/Sub + Socket.io instead of polling.

**Flow**:
1. Vendor replies to RFP email
2. Gmail pushes notification to our webhook via Pub/Sub
3. Backend fetches email, parses with AI
4. Saves proposal to DB
5. Broadcasts to frontend via Socket.io

**Why**:
- Instant updates (< 2 seconds from email sent to dashboard update)
- No polling overhead
- Production-ready (Google's infrastructure)
- Scales to thousands of concurrent users

**Trade-off**: More complex setup, requires Google Cloud project.

---

#### 5. **Compliance Scoring Approach**

**Decision**: Binary fulfillment (true/false) with detailed reasons, not a numeric score.

**Output**:
```json
{
  "fulfilled": true,
  "reasons": ["Price within budget", "Delivery meets deadline"],
  "summary": "Vendor meets all requirements"
}
```

**Why**:
- Easier for users to understand (✅ or ❌)
- Aligns with procurement decision-making (pass/fail criteria)
- Detailed reasons provide transparency
- AI is better at binary classification than subjective scoring

**Alternative considered**: 0-10 score (rejected as subjective and harder to explain)

---

#### 6. **Draft Management**

**Decision**: Allow saving RFPs as drafts with selected vendors before sending.

**Why**:
- Users need time to review vendor selection
- Prevents accidental sends
- Allows preparing multiple RFPs in advance
- Better UX (save progress)

**Implementation**: `selectedVendors` field stores IDs before dispatch, moved to `sentToVendors` after sending.

---

#### 7. **Status Flow**

**RFP Status Lifecycle**:
```
draft → published → closed
```

**Decision**: Three statuses instead of complex workflow.

**Why**:
- `draft`: Not sent yet, can delete
- `published`: Sent to vendors, collecting responses
- `closed`: Procurement complete, archived

Simple and covers all use cases.

---

### Assumptions

#### Email Assumptions

1. **Vendor Response Format**:
   - Assumed vendors reply with price, delivery date, and warranty in unstructured text
   - AI extracts these fields (no specific template required)
   - If fields are missing, AI returns `null` (handled gracefully)

2. **Email Threading**:
   - Assumed vendors reply to the original RFP email thread
   - Matching is done by finding the latest proposal for that vendor
   - **Limitation**: If a vendor responds to multiple RFPs simultaneously, manual intervention may be needed

3. **Email Delivery**:
   - Assumed Brevo/Gmail successfully delivers emails (no retry logic for failed sends currently)
   - Errors are logged but not automatically retried

---

#### AI Assumptions

1. **AI Accuracy**:
   - Assumed GPT-3.5 can accurately parse natural language with ~90% accuracy
   - Human review is recommended for critical procurements
   - **Edge case**: Very ambiguous descriptions may result in incorrect parsing

2. **AI Cost**:
   - Each RFP creation costs ~$0.001 (input + output tokens)
   - Each proposal analysis costs ~$0.002
   - Acceptable for typical usage (< $10/month for 1000 RFPs)

3. **Compliance Logic**:
   - Assumed AI can determine compliance based on:
     - Price ≤ Budget
     - Delivery Date ≤ Deadline
     - Warranty provided if required
   - Complex requirements (e.g., certifications, specific brands) may need manual review

---

#### Vendor Assumptions

1. **Vendor Categories**:
   - Assumed pre-defined categories: Hardware, Software, Office Supplies, Services, etc.
   - AI matches RFP to categories (e.g., "laptops" → Hardware)
   - **Limitation**: New categories require manual vendor tagging

2. **Vendor Database**:
   - Assumed vendors are pre-registered in the system
   - New vendors must be added manually via API or admin panel
   - **Future enhancement**: Auto-add vendors from email responses

---

#### Data Format Assumptions

1. **Date Formats**:
   - Assumed AI can parse various date formats ("2 weeks", "Jan 30", "2026-01-30")
   - Stored as ISO 8601 in MongoDB

2. **Currency**:
   - Assumed USD for all transactions
   - No multi-currency support currently

3. **Quantities**:
   - Assumed integer quantities (no decimals for "3.5 laptops")

---

#### Performance Assumptions

1. **Concurrency**:
   - Assumed < 100 concurrent users
   - Socket.io handles up to 10k connections (sufficient for MVP)

2. **Email Volume**:
   - Assumed < 1000 vendor responses per day
   - Gmail API quota: 1 billion requests/day (sufficient)

3. **Database**:
   - Assumed < 100k RFPs and proposals
   - MongoDB performs well without sharding at this scale

---

#### Security Assumptions

1. **Authentication**:
   - Currently **no user authentication** (MVP scope)
   - Assumed trusted users only
   - **Production requirement**: Add JWT auth and role-based access

2. **Email Verification**:
   - Assumed emails from vendors are legitimate
   - No spam filtering or verification currently
   - **Risk**: Malicious emails could be processed

3. **API Security**:
   - No rate limiting currently
   - Assumed internal network or trusted environment
   - **Production requirement**: Add rate limiting and API keys

---

## 🤖 AI Tools Usage

### AI Tools Used During Development

1. **Claude Code (Anthropic)** - Primary development assistant
2. **GitHub Copilot** - Code completion and suggestions
3. **ChatGPT (OpenAI)** - Architecture planning and debugging

---

### What They Helped With

#### 1. **Boilerplate Code Generation**

**Tools**: GitHub Copilot, Claude Code

**Examples**:
- Express route handlers (CRUD operations)
- Mongoose schema definitions
- Error handling middleware
- Environment variable configuration

**Prompt Example**:
> "Create a Mongoose schema for RFP with fields: originalDescription (string), structuredData (object), status (enum: draft/published/closed), sentToVendors (array of vendor IDs)"

**Result**: Generated complete schema with validation, defaults, and timestamps in seconds.

---

#### 2. **AI Integration & Prompt Engineering**

**Tools**: Claude Code, ChatGPT

**Examples**:
- Crafting OpenAI system prompts for RFP parsing
- Debugging JSON parsing issues
- Optimizing prompt temperature and parameters

**Notable Prompt Approach**:
```javascript
// Instead of one complex prompt, split into focused prompts:
// BAD: "Parse this RFP and compare it to proposals and score vendors"
// GOOD: Three separate prompts:
//   1. "Extract structured data from this RFP description"
//   2. "Extract price, date, warranty from this email"
//   3. "Compare RFP requirements to proposal data, return pass/fail"
```

**What I Learned**: Focused prompts with `response_format: 'json_object'` are more reliable than free-form responses.

---

#### 3. **Email Integration Debugging**

**Tools**: Claude Code, ChatGPT

**Examples**:
- Gmail OAuth flow implementation
- Pub/Sub webhook configuration
- Brevo API integration
- Handling base64-encoded email content

**Specific Help**:
- Claude Code explained Gmail's `historyId` concept for tracking new emails
- Copilot suggested using `@google-cloud/pubsub` library instead of manual HTTP requests
- ChatGPT provided example Pub/Sub subscription configurations

---

#### 4. **Architecture & Design Decisions**

**Tools**: Claude Code, ChatGPT

**Prompt Examples**:
> "Should I embed proposals in the RFP document or use separate collections with references? Consider: querying proposals independently, real-time updates, and data integrity."

**Response**: Recommended separate collections with references (which I implemented).

> "How should I structure compliance analysis? Numeric score (0-10) or binary (pass/fail) with reasons?"

**Response**: Suggested binary with reasons for transparency (which proved better for UI).

---

#### 5. **Error Handling & Edge Cases**

**Tools**: GitHub Copilot

**Examples**:
- Try-catch blocks for async operations
- Graceful AI service failures (503 responses)
- Handling missing email fields

**Auto-suggestions that helped**:
```javascript
// Copilot suggested this pattern automatically:
try {
  const result = await parseProposalEmail(emailBody);
} catch (error) {
  if (error.message.includes('AI')) {
    return res.status(503).json({ error: 'AI service unavailable' });
  }
  return res.status(500).json({ error: 'Failed to parse proposal' });
}
```

---

#### 6. **Socket.io Real-Time Updates**

**Tools**: Claude Code, ChatGPT

**Challenge**: Needed real-time proposal updates when vendors reply.

**Prompt**:
> "I have Gmail Pub/Sub pushing notifications to a webhook. How do I broadcast new proposals to the frontend in real-time using Socket.io?"

**Solution provided**:
1. Initialize Socket.io server in `server.js`
2. Create singleton pattern in `config/socket.js`
3. Emit events from proposal controller
4. Join rooms by RFP ID for targeted updates

**Implementation**:
```javascript
// Auto-suggested by Copilot after Claude explained the pattern
const io = socketConfig.getIO();
io.to(`rfp-${rfpId}`).emit('new-proposal', proposalData);
```

---

#### 7. **README & Documentation**

**Tools**: Claude Code

**Prompt**:
> "Generate a comprehensive README with: setup instructions, API documentation with examples, tech stack, design decisions, and AI tools usage section."

**Result**: This entire README file (with my edits for accuracy).

---

### Notable Prompts & Approaches

#### Prompt Engineering Lessons

1. **Specificity wins**:
   - ❌ "Parse this RFP"
   - ✅ "Extract items (name, specs, quantity), budget (number), deadline (ISO date) from this RFP description"

2. **Provide examples in prompts**:
   ```javascript
   const systemPrompt = `Extract these fields:
   - totalPrice (number) - Example: 50000
   - deliveryDate (ISO date) - Example: "2026-01-30T00:00:00.000Z"
   - warrantyProvided (string) - Example: "2 years comprehensive"

   Return ONLY JSON.`;
   ```

3. **Use JSON mode for structured outputs**:
   ```javascript
   const response = await openai.chat.completions.create({
     model: 'gpt-3.5-turbo',
     response_format: { type: 'json_object' },  // Forces valid JSON
     temperature: 0.2  // Low temp for consistency
   });
   ```

---

### What I Learned

#### 1. **AI as a Pair Programmer**

**Before**: Manually writing boilerplate, Googling syntax, reading docs.

**After**: AI generates 70% of boilerplate, I review and customize 30%.

**Time saved**: ~40% faster development (especially for CRUD operations).

---

#### 2. **AI Limitations I Discovered**

- **Hallucinations**: AI sometimes suggested non-existent library methods
  - *Example*: Suggested `mongoose.Schema.ref()` which doesn't exist (should be `ref: 'Model'`)
  - *Fix*: Always verify suggestions against official docs

- **Outdated patterns**: Copilot sometimes suggested deprecated approaches
  - *Example*: Old Mongoose middleware syntax
  - *Fix*: Cross-check with recent docs

- **Over-complexity**: AI tends to over-engineer simple problems
  - *Example*: Suggested a caching layer for 100-record vendor list
  - *Fix*: Question every suggestion ("Do I really need this?")

---

#### 3. **What Changed Because of AI Tools**

**Initial Plan** (before AI):
- Simple email polling every 5 minutes
- Manual RFP form (no AI parsing)
- Static vendor list (no matching)

**Final Implementation** (after AI):
- Real-time Gmail Pub/Sub + Socket.io (Claude suggested this)
- AI-powered natural language RFP creation
- Intelligent vendor matching by category
- Automated compliance analysis

**Why the change**: AI tools made complex features feasible in a short timeline. Without AI assistance, I would have stuck to the simpler MVP.

---

#### 4. **Best Practices I Developed**

1. **Use AI for exploration, not blind copy-paste**:
   - Ask "Why is this approach better?"
   - Understand the code before committing

2. **Iterate with AI**:
   - First pass: "Generate basic RFP schema"
   - Second pass: "Add validation and indexes"
   - Third pass: "Add complianceStatus field"

3. **Debugging with AI**:
   - Instead of describing the error, paste the error + relevant code
   - AI often spots issues I missed (typos, async/await mistakes)

4. **Code review with AI**:
   - Asked Claude to review my compliance analysis logic
   - It suggested handling `null` values better (which I implemented)

---

### Productivity Impact

**Estimated Time Savings**: 50+ hours

**Breakdown**:
- Boilerplate code: ~10 hours saved
- API documentation: ~5 hours saved
- Debugging email integration: ~8 hours saved
- Architecture decisions: ~5 hours saved
- Learning Socket.io + Pub/Sub: ~12 hours saved
- Writing this README: ~3 hours saved

**What I spent more time on (vs. traditional development)**:
- Prompt engineering and refinement: +3 hours
- Reviewing and testing AI-generated code: +5 hours
- Fixing AI hallucinations: +2 hours

**Net time saved**: ~40 hours (roughly 40% faster development)

---

## 📝 License

This project is built for educational purposes as part of a coding assessment.

---

## 👤 Author

**Akshat**
Backend Developer
Email: akshatjangir1710@gmail.com

---

## 🙏 Acknowledgments

- OpenAI for GPT-3.5 API
- Anthropic for Claude Code development assistance
- Google Cloud for Gmail API and Pub/Sub
- Brevo for transactional email service
- MongoDB for database solution
- Socket.io for real-time communication

---

**Last Updated**: January 2026
