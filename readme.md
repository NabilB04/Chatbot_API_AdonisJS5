# Chatbot API - AdonisJS 5

Sebuah REST API untuk sistem chatbot yang dibangun dengan AdonisJS 5, PostgreSQL, dan integrasi dengan external chatbot service Majadigi.

## 📋 Fitur

- ✅ Kirim pertanyaan ke chatbot
- ✅ Manajemen percakapan (conversation)
- ✅ Riwayat pesan
- ✅ Autentikasi dengan Basic Auth & API Key
- ✅ Paginasi untuk daftar percakapan
- ✅ Database transaction untuk konsistensi data
- ✅ Soft delete untuk conversation dan message

## 🛠 Teknologi

- **Framework**: AdonisJS 5
- **Database**: PostgreSQL
- **ORM**: Lucid ORM
- **Authentication**: Basic Auth + API Key
- **Validation**: AdonisJS Validator
- **External API**: Axios untuk integrasi chatbot

## 📁 Struktur Project

```
├── app/
│   ├── Controllers/Http/
│   │   ├── ConversationsController.ts    # Mengelola percakapan
│   │   ├── MessagesController.ts          # Mengelola pesan
│   │   └── QuestionsController.ts         # Endpoint utama untuk chatbot
│   ├── Middleware/
│   │   ├── Auth.ts                        # Basic authentication
│   │   └── BasicAuth.ts                   # API Key authentication
│   ├── Models/
│   │   ├── Conversation.ts                # Model percakapan
│   │   ├── Message.ts                     # Model pesan
│   │   └── User.ts                        # Model user
│   ├── Services/
│   │   └── ChatbotService.ts              # Service untuk external chatbot API
│   └── Validators/
│       └── QuestionValidator.ts           # Validasi input pertanyaan
├── database/
│   └── migrations/                        # Database schema
├── config/                                # Konfigurasi aplikasi
└── start/
    └── routes.ts                          # Definisi routes
```

## 📚 API Documentation

### Base URL
```
http://localhost:3333/api
```

### Authentication
API menggunakan dua jenis autentikasi:
- **API Key**: Header `API_KEY` untuk endpoint public
- **Basic Auth**: Username/password untuk endpoint admin

---

### 1. 💬 Kirim Pertanyaan ke Chatbot

**Endpoint**: `POST /api/questions`

**Headers**:
```
API_KEY: your-secret-api-key
Content-Type: application/json
```

**Request Body**:
```json
{
  "question": "Halo, apa kabar?",
  "additional_context": "Context tambahan (opsional)",
  "session_id": "unique-session-id (opsional)"
}
```

**Response Success (200)**:
```json
{
  "success": true,
  "data": {
    "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
    "session_id": "abc123",
    "user_message": "Halo, apa kabar?",
    "bot_response": "Halo! Saya baik, terima kasih. Ada yang bisa saya bantu?",
    "timestamp": "2025-07-20T10:30:00.000Z"
  }
}
```

**Response Error (400/500)**:
```json
{
  "success": false,
  "message": "Failed to process question",
  "error": "Error details"
}
```

---

### 2. 📜 Daftar Percakapan

**Endpoint**: `GET /api/conversations`

**Authentication**: Basic Auth

**Query Parameters**:
- `page` (optional): Halaman (default: 1)
- `limit` (optional): Jumlah data per halaman (default: 10)
- `session_id` (optional): Filter berdasarkan session ID

**Example**:
```
GET /api/conversations?page=1&limit=5&session_id=abc123
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "meta": {
      "total": 25,
      "per_page": 10,
      "current_page": 1,
      "last_page": 3,
      "first_page": 1,
      "first_page_url": "/?page=1",
      "last_page_url": "/?page=3",
      "next_page_url": "/?page=2",
      "previous_page_url": null
    },
    "data": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "session_id": "abc123",
        "created_at": "2025-07-20T10:00:00.000Z",
        "updated_at": "2025-07-20T10:30:00.000Z",
        "lastMessage": {
          "id": "msg-123",
          "message": "Terima kasih atas informasinya!",
          "sender_type": "user",
          "created_at": "2025-07-20T10:30:00.000Z"
        }
      }
    ]
  }
}
```

---

### 3. 🔍 Detail Percakapan

**Endpoint**: `GET /api/conversations/{id}`

**Authentication**: Basic Auth

**Parameters**:
- `id`: Conversation ID atau Session ID

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "session_id": "abc123",
    "created_at": "2025-07-20T10:00:00.000Z",
    "updated_at": "2025-07-20T10:30:00.000Z",
    "messages": [
      {
        "id": "msg-1",
        "sender_type": "user",
        "message": "Halo, apa kabar?",
        "created_at": "2025-07-20T10:00:00.000Z"
      },
      {
        "id": "msg-2",
        "sender_type": "bot",
        "message": "Halo! Saya baik, terima kasih.",
        "created_at": "2025-07-20T10:00:30.000Z"
      }
    ]
  }
}
```

---

### 4. 🗑️ Hapus Percakapan

**Endpoint**: `DELETE /api/conversations/{id}`

**Authentication**: Basic Auth

**Response (200)**:
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

---

### 5. 🗑️ Hapus Pesan

**Endpoint**: `DELETE /api/messages/{id}`

**Authentication**: Basic Auth

**Response (200)**:
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

## 🎯 Alur Kerja Aplikasi

### 1. **Proses Chat Normal**
```
User → POST /questions → Validasi → Cari/Buat Conversation → 
Simpan User Message → Call External Chatbot API → 
Simpan Bot Response → Update Last Message → Return Response
```

### 2. **Session Management**
- Jika `session_id` tidak diberikan, sistem generate UUID baru
- Jika `session_id` sudah ada, pesan ditambahkan ke conversation yang sama
- Setiap conversation memiliki `lastMessage` untuk tracking pesan terakhir

### 3. **Database Transaction**
- Semua operasi database dalam `QuestionsController.store()` menggunakan transaction
- Jika ada error, semua perubahan di-rollback
- Memastikan konsistensi data

## 🔧 Konfigurasi External Chatbot

External chatbot service dikonfigurasi di `ChatbotService.ts`:

```typescript
private static baseUrl = 'https://api.majadigidev.jatimprov.go.id/api/external/chatbot'

public static async sendMessage(question: string, additionalContext: string, sessionId: string)
```

**Request ke External API**:
```json
{
  "question": "User question",
  "additional_context": "Additional context",
  "session_id": "session-id"
}
```

## 🛡️ Security

### API Key Authentication
- Semua request ke `/questions` harus menyertakan header `API_KEY`
- API Key diset di environment variable `API_KEY`

### Basic Authentication
- Endpoint admin menggunakan Basic Auth
- User harus terdaftar di database `users` table
- Password di-hash menggunakan Argon2/Bcrypt

## 📊 Database Schema

### Conversations Table
```sql
- id (UUID, Primary Key)
- session_id (String, Indexed)
- last_message_id (UUID, Foreign Key ke messages)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Messages Table
```sql
- id (UUID, Primary Key)
- conversation_id (UUID, Foreign Key ke conversations)
- sender_type (Enum: 'user'|'bot')
- message (Text)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Users Table
```sql
- id (Integer, Primary Key)
- email (String, Unique)
- username (String, Unique)
- password (String, Hashed)
- created_at (Timestamp)
- updated_at (Timestamp)
```

## 🧪 Testing

### Manual Testing dengan cURL

**1. Test Kirim Pertanyaan**:
```bash
curl -X POST http://localhost:3333/api/questions \
  -H "API_KEY: your-secret-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Halo, apa kabar?",
    "session_id": "test-session-123"
  }'
```

**2. Test Get Conversations**:
```bash
curl -X GET http://localhost:3333/api/conversations \
  -u "username:password"
```

**3. Test Get Conversation Detail**:
```bash
curl -X GET http://localhost:3333/api/conversations/test-session-123 \
  -u "username:password"
```

## 🚀 Deployment

### Environment Production
```env
NODE_ENV=production
HOST=0.0.0.0
PORT=3333

# Database production
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
DB_DATABASE=chatbot_production

# Security
API_KEY=your-very-secure-api-key
APP_KEY=your-very-secure-app-key
```

### Build & Start
```bash
npm run build
npm start
```

## 📝 Logging

Aplikasi menggunakan AdonisJS Logger:
- **Development**: Pretty print logs ke console
- **Production**: Structured JSON logs
- Error handling dengan try-catch dan proper logging

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

