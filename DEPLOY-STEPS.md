# Deploying One Chuan Grove framework 1.5.2 (quick calculator): only when you approve

1. Open github.com/kentanthepropertyguy/one-chuan-grove and check that the latest commit on `main` is `5a1152a`. If it is not, stop and send this to Claude so the release is rebuilt on the newer site.
2. Click the branch menu, type `calculator-1-5-2`, and choose "Create branch".
3. On that branch, choose Add file > Upload files. Open the folder `1-upload-to-one-chuan-grove-repo`, select everything inside it (the four files and the `assets` folder) and drop them in. GitHub replaces the four files and adds three new files in `assets`.
4. Commit message "One Chuan Grove: framework 1.5.2 quick calculator", then choose to open a pull request.
5. In the pull request, check that "Files changed" shows: index.html, 404.html, build-info.json, project.meta.json, assets/ms.1-5-2.css, assets/ms.1-5-2.js, assets/ms-calc.1-5-2.js.
6. Merge only when you are ready for it to go live.
7. Open https://onechuangrove.kentanthepropertyguy.com/ on a computer and on a phone:
   - Affordability follows Pricing, and the price box is empty.
   - Typing 1.85m shows $6,624 a month, with a $1,387,500 loan, $92,500 cash, $370,000 remaining and $62,100 stamp duty.
   - "Explore detailed calculations ›" opens Groundwork's "What will this home cost me?" in a new tab.
8. To undo, repeat steps 2–6 with the four files in `ROLLBACK`, which is the live Release C site. The 1.5.1 stylesheet and script are still in the repository, so nothing else is needed.
