git checkout backup/organize-frontend-files-safe
git pull origin backup/organize-frontend-files-safe
git merge feature/organize-frontend-files
git push origin backup/organize-frontend-files-safe
git checkout feature/organize-frontend-files


Para sa update ng testing branch:

git add -A
git commit -m "describe update"
git push origin revision-phase1-landing-policy

Para sa pag push sa main branch:

git checkout main
git pull origin main
git merge revision-phase1-landing-policy
git push origin main