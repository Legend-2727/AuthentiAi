# Veridica

A blockchain-powered content authenticity verification platform built with React, featuring AI-generated video and audio content creation with Algorand blockchain protection.

## 🌟 Features

- **🔗 Blockchain Content Protection**: Automatic registration of all content on Algorand blockchain
- **🎥 AI Video Generation**: Create videos using personal or system replicas via Tavus API  
- **🎵 AI Audio Creation**: Generate AI voices using ElevenLabs API
- **📁 Content Upload**: Direct video and audio upload with automatic blockchain registration
- **🛡️ Ownership Verification**: Cryptographic proof of content ownership and authenticity
- **🌐 Social Feed**: Share and interact with verified community content
- **🔐 Secure Authentication**: User management with Supabase
- **⚡ Deployment Ready**: Production-ready with blockchain-only mode option

## 🔐 Blockchain Security

Every piece of content uploaded or generated through Veridica is automatically:
- **Hashed** using SHA-256 cryptographic algorithm
- **Registered** on Algorand blockchain for immutable proof
- **Verified** with transaction IDs and AlgoExplorer links
- **Protected** against unauthorized duplication claims

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Copy `.env.example` to `.env` and configure your settings:
   ```bash
   cp .env.example .env
   ```

3. **Blockchain Setup** (Required)
   - Get Algorand testnet account: https://bank.testnet.algorand.network/
   - Get Nodely API token: Contact support@nodely.io
   - Add your 25-word mnemonic and API token to `.env`

4. **Start Development**
   ```bash
   npm run dev
   ```

## 🌍 Deployment Options

### Option 1: Full Database Mode (Recommended)
- Requires Supabase Pro ($25/month)
- Complete ownership verification
- Cross-user duplicate detection

### Option 2: Blockchain-Only Mode (Budget-Friendly)
- Zero additional costs
- Core blockchain protection active
- Limited cross-user features

Set in `.env`:
```bash
VITE_DEPLOYMENT_MODE=blockchain-only  # or 'full'
```

## 🛠️ Technologies

- **Frontend**: React 18 + TypeScript + Vite
- **Blockchain**: Algorand (via algosdk + Nodely API)
- **Database**: Supabase (PostgreSQL)
- **AI Services**: Tavus (video) + ElevenLabs (audio)
- **Styling**: TailwindCSS + Framer Motion
- **Authentication**: Supabase Auth

## 📚 Documentation

- [🔗 Blockchain Setup Guide](ALGORAND_SETUP_GUIDE.md)
- [🗄️ Database Setup](SUPABASE_SETUP_GUIDE.md)
- [🚀 Production Deployment](PRODUCTION_DEPLOYMENT_GUIDE.md)
- [🛡️ Ownership Verification](OWNERSHIP_VERIFICATION_GUIDE.md)

## 🧪 Production Readiness

Check deployment readiness:
```bash
npm run build:check
```

Build for production:
```bash
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- 📧 Email: support@veridica.app
- 🐛 Issues: [GitHub Issues](https://github.com/Legend-2727/AuthentiAi/issues)
- 📖 Docs: [Documentation](README.md)
