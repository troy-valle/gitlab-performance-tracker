This is a project to track activity and performance of users in your GitLab organization.

## Getting Started
Go into GitLab and generate an access token with read access to the Gitlab API

Create a .env.local file

```
GITLAB_ACCESS_TOKEN={GITLAB_TOKEN}
```

Create a team.json file with team members you want to see on the home page.

```
[
    {
        "id": 123,
        "username": "user.name",
        "public_email": "",
        "name": "John Smith",
        "state": "active",
        "locked": false,
        "avatar_url": "",
        "web_url": ""
    },
    ...
]
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
