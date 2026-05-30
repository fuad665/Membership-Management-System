# 🚀 GitHub Profile Setup Instructions

To deploy your new, world-class software engineer portfolio README on your GitHub profile page, follow these simple steps:

---

## Step 1: Create Your Special Repository
1. Log in to your GitHub account: **[https://github.com](https://github.com)**.
2. Click **New Repository** (or go to [https://github.com/new](https://github.com/new)).
3. Under **Repository name**, type your exact GitHub username: **`fuad665`**.
   * *Note: GitHub will show a message saying: "You found a secret! `fuad665/fuad665` is a special repository that you can use to add a README.md to your GitHub profile."*
4. Set the repository visibility to **Public** (Crucial: it must be public to render on your profile).
5. Do **not** initialize with a README, `.gitignore`, or license. Leave it empty.
6. Click **Create repository**.

---

## Step 2: Push the Profile Files to GitHub
Open your local terminal in the `github-profile` directory (e.g. `c:\Users\Fuadh\Desktop\Membership System web\github-profile`) and run these Git commands:

```bash
# 1. Initialize git inside the profile directory
git init

# 2. Rename default branch to main
git checkout -b main

# 3. Add all profile files (README, banner.svg, and .github folder)
git add .

# 4. Commit files
git commit -m "Initialize world-class profile README and animated banner"

# 5. Link it to your new special repository
git remote add origin https://github.com/fuad665/fuad665.git

# 6. Push the code
git push -u origin main
```

---

## Step 3: Enable Workflow Write Permissions (Crucial for Snake Grid)
For the automated Contribution Snake to run and commit the generated snake SVGs to your repository, you need to enable write permissions for GitHub Actions:

1. Open your repository `fuad665/fuad665` on GitHub.
2. Click on the **Settings** tab.
3. In the left sidebar, click **Actions** > **General**.
4. Scroll down to **Workflow permissions**.
5. Select **Read and write permissions**.
6. Click **Save**.

---

## Step 4: Run the Contribution Snake Workflow
Once permissions are set, trigger the workflow to generate your snake art for the first time:

1. In your repository `fuad665/fuad665` on GitHub, click the **Actions** tab.
2. Under **Workflows** in the left panel, click on **Generate Snake**.
3. Click the **Run workflow** dropdown on the right, and click the **Run workflow** button.
4. Within 1 minute, the action will complete, creating an `output` branch containing your contribution snake SVGs.
5. Your profile page will now display the animated snake contribution graph automatically!
