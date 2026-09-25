# Deployment & Cloud Hosting Guide

Smart ServiceDesk is built to be cloud-ready and can be deployed to any modern cloud infrastructure. This guide covers how to push your code to GitHub and deploy it across popular free and production platforms.

---

## Part 1: Push Code to GitHub

### 1. Create a Repository on GitHub
1. Open your browser and go to: **[https://github.com/new](https://github.com/new)**
2. Set the **Repository Name** to: `smart-servicedesk`
3. Description: `Smart ServiceDesk – Enterprise IT Issue Tracking & Resolution Platform (Spring Boot + React + MySQL)`
4. Set visibility to **Public** (or **Private**).
5. **Do NOT** check "Add a README file", "Add .gitignore", or choose a license (these already exist locally).
6. Click **Create repository**.

### 2. Push Your Local Code
Open PowerShell or your terminal in the project root:
```powershell
cd "d:\New folder\smart-servicedesk"

# Add the remote GitHub repository
git remote add origin https://github.com/akash1172007akash-droid/smart-servicedesk.git

# Set default branch to main
git branch -M main

# Push code to GitHub
git push -u origin main
```
*(If prompted by Git, sign in using your browser or personal access token).*

---

## Part 2: Cloud Deployment Pathways

You have three streamlined deployment options depending on your hosting preference:

### Option A: Render.com (Recommended Free Hosting)
Render allows hosting the Backend Web Service, Database, and Frontend Static Site with zero credit card required.

#### Step 1: Provision a Free MySQL Database
1. Sign up / Log in to [Render.com](https://render.com).
2. You can create a free PostgreSQL or MySQL instance, or use a free managed MySQL service such as:
   - **[Aiven.io](https://aiven.io)** (Free forever MySQL cloud instance)
   - **[Railway.app](https://railway.app)** (Provision MySQL in 1 click)
   - **[Clever Cloud](https://www.clever-cloud.com)**
3. Obtain your Database Connection URL:
   - Host: `mysql-xxxx.aivencloud.com`
   - Port: `xxxx`
   - Database Name: `smart_servicedesk`
   - User: `root` or `avnadmin`
   - Password: `YOUR_CLOUD_PASSWORD`

#### Step 2: Deploy Spring Boot Backend on Render
1. On the Render Dashboard, click **New +** $\rightarrow$ **Web Service**.
2. Connect your GitHub repository: `akash1172007akash-droid/smart-servicedesk`.
3. Configure the service:
   - **Name:** `smart-servicedesk-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Java` (or `Docker`)
   - **Build Command:** `mvn clean package -DskipTests`
   - **Start Command:** `java -jar target/smart-servicedesk-backend-1.0.0.jar`
4. Add the following **Environment Variables** in Render:
   | Key | Value |
   |---|---|
   | `SPRING_DATASOURCE_URL` | `jdbc:mysql://<HOST>:<PORT>/smart_servicedesk?useSSL=true&serverTimezone=UTC` |
   | `DB_USERNAME` | `<YOUR_DB_USER>` |
   | `DB_PASSWORD` | `<YOUR_DB_PASSWORD>` |
   | `JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` |
5. Click **Create Web Service**. Render will build and deploy your backend.
6. Note down your backend URL (e.g. `https://smart-servicedesk-backend.onrender.com`).

#### Step 3: Deploy React Frontend on Vercel or Render
**On Vercel (Fastest & Best Performance):**
1. Sign in to [Vercel](https://vercel.com) using your GitHub account.
2. Click **Add New...** $\rightarrow$ **Project**.
3. Import `smart-servicedesk`.
4. Configure Project:
   - **Root Directory:** Edit $\rightarrow$ select `frontend`.
   - **Framework Preset:** `Vite`.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. In `frontend/src/api/axiosClient.js`, update `baseURL` to your deployed backend URL:
   ```javascript
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_URL || '/api',
   });
   ```
6. Add Environment Variable in Vercel:
   - `VITE_API_URL`: `https://smart-servicedesk-backend.onrender.com/api`
7. Click **Deploy**. Your frontend is now live globally!

---

### Option B: 1-Click Deployment with Docker Compose (VPS / AWS / DigitalOcean)

If you have a Linux virtual machine (Ubuntu on DigitalOcean droplet, AWS EC2, or Linode):

1. SSH into your server:
   ```bash
   ssh root@your-server-ip
   ```
2. Clone your repository:
   ```bash
   git clone https://github.com/akash1172007akash-droid/smart-servicedesk.git
   cd smart-servicedesk
   ```
3. Launch all 3 services (Database, Backend, and Nginx Frontend) with one command:
   ```bash
   docker compose up -d --build
   ```
4. Check running containers:
   ```bash
   docker compose ps
   ```
Your app is live on `http://your-server-ip:3000` with the API communicating internally on the Docker network!

---

### Option C: Railway.app (Zero-Config All-in-One)
1. Sign up on [Railway.app](https://railway.app).
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Select `smart-servicedesk`.
4. Add a **MySQL** database from Railway's template menu.
5. Link the backend service to the MySQL environment variables.
6. Railway automatically exposes the public URL!
