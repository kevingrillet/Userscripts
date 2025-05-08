// ==UserScript==
// @name          [GitHub] IssuesExport
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Export Issues
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @tag           kevingrillet
// @tag           github.com
// @tag           deprecated
// @version       0.7

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/deprecated/[GitHub]%20IssuesExport.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/deprecated/[GitHub]%20IssuesExport.user.js

// @match         https://github.com/*/*/issues
// @icon          https://www.google.com/s2/favicons?domain=github.com
// @grant         GM_getResourceText
// @require       https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.4/FileSaver.min.js
// @resource      PRIMER_CSS https://unpkg.com/@primer/css/dist/primer.css
// @resource      PRIMER_CSS_SYNTAX_LIGHT https://raw.githubusercontent.com/primer/github-syntax-light/master/lib/github-light.css
// @resource      PRIMER_CSS_SYNTAX_DARK https://raw.githubusercontent.com/primer/github-syntax-dark/master/lib/github-dark.css
// @run-at        document-end
// ==/UserScript==

'use strict';

var export_md = false,
    export_json = false,
    repo,
    theme_light = false;

function init() {
    // Create parent div in bar
    var e = document.querySelector('.js-check-all-container').firstElementChild.appendChild(document.createElement('div'));
    e.className = 'ml-3 d-flex flex-justify-between width-full width-md-auto';
    // Create btn
    e = e.appendChild(document.createElement('div'));
    e.className = 'btn btn-primary';
    e.onclick = prepare;
    // Create span in btn
    e = e.appendChild(document.createElement('span'));
    e.className = 'd-none d-md-block';
    e.innerText = 'Export';
}

function prepare() {
    if (document.querySelector('#my_dialog')) {
        document.querySelector('#my_dialog').remove();
    }
    var dial = document.body.appendChild(document.createElement('dialog'));
    dial.id = 'my_dialog';
    dial.innerHTML = `
        <form method="dialog">
            <p>Output type:</p>
            <div>
                <input type="radio" id="my_dialog_html_dark" name="my_dialog_output" value="html_dark" checked>
                <label for="my_dialog_html_dark">HTML Dark</label>
            </div>
            <div>
                <input type="radio" id="my_dialog_html_light" name="my_dialog_output" value="html_light">
                <label for="my_dialog_html_light">HTML Light</label>
            </div>
            <div>
                <input type="radio" id="my_dialog_markdown" name="my_dialog_output" value="markdown">
                <label for="my_dialog_markdown">Markdown</label>
            </div>
            <div>
                <input type="radio" id="my_dialog_json" name="my_dialog_output" value="json">
                <label for="my_dialog_json">JSON</label>
            </div>
            <menu>
                <button id="confirmBtn" value="default">Confirm</button>
                <button value="cancel">Cancel</button>
            </menu>
        </form>`;

    dial.showModal();

    document.querySelector('#confirmBtn').onclick = function () {
        export_json = document.querySelector('#my_dialog_json').checked;
        export_md = document.querySelector('#my_dialog_markdown').checked;
        theme_light = document.querySelector('#my_dialog_html_light').checked;

        run();
    };
}

function run() {
    const GH_OWNER = window.location.pathname.split('/')[1];
    const GH_REPO = window.location.pathname.split('/')[2];
    const PER_PAGE = 100;

    var fetch_count = 0;

    repo = {
        full_name: `${GH_OWNER}/${GH_REPO}`,
        html_url: `https://github.com/${GH_OWNER}/${GH_REPO}`,
    };

    function afterFetch() {
        //console.debug(repo);
        if (export_json) {
            let blobjson = new Blob([JSON.stringify(repo)], {
                type: 'application/json',
            });
            window.saveAs(blobjson, `${GH_OWNER}_${GH_REPO}_issues.json`);
        } else {
            // Convert Json to Markdown
            let md = jsonToMarkdown();

            if (export_md) {
                let blobmd = new Blob([md], {
                    type: 'text/plain;charset=utf-8',
                });
                window.saveAs(blobmd, `${GH_OWNER}_${GH_REPO}_issues.md`);
            } else {
                render(md);
            }
        }
    }

    function fetchReviewsComments(pull_number, review_id, current_page = 1) {
        //console.debug(`https://api.github.com/repos/${repo.full_name}/pulls/${pull_number}/reviews/${review_id}/comments?per_page=${PER_PAGE}&page=${current_page}`);
        fetch(`https://api.github.com/repos/${repo.full_name}/pulls/${pull_number}/reviews/${review_id}/comments?per_page=${PER_PAGE}&page=${current_page}`)
            .then((response) => response.json())
            .then((data) => {
                //console.debug(data); // Prints result from `response.json()` in getRequest
                for (let i = 0; i < data.length; i++) {
                    let comment = {
                        body: data[i].body,
                        created_at: data[i].created_at,
                        user_login: data[i].user?.login,
                    };
                    repo.issues
                        .find((e) => e.number === pull_number)
                        .reviews.find((e) => e.id === review_id)
                        .comments.push(comment);
                }
                fetch_count--;
                if (fetch_count === 0) {
                    afterFetch();
                }
            })
            .catch((error) => console.error(error));
    }

    function fetchReviews(pull_number /*, current_page = 1*/) {
        //console.debug(`https://api.github.com/repos/${repo.full_name}/pulls/${pull_number}/reviews?per_page=${PER_PAGE}`);
        fetch(`https://api.github.com/repos/${repo.full_name}/pulls/${pull_number}/reviews?per_page=${PER_PAGE}`)
            .then((response) => response.json())
            .then((data) => {
                //console.debug(data); // Prints result from `response.json()` in getRequest
                for (let i = 0; i < data.length; i++) {
                    let review = {
                        body: data[i].body,
                        comments: [],
                        id: data[i].id,
                        submitted_at: data[i].submitted_at,
                        user_login: data[i].user?.login,
                    };
                    repo.issues.find((e) => e.number === pull_number).reviews.push(review);
                    fetch_count++;
                    fetchReviewsComments(pull_number, review.id);
                }
                fetch_count--;
                if (fetch_count === 0) {
                    afterFetch();
                }
            })
            .catch((error) => console.error(error));
    }

    function fetchComments(issue_number) {
        //console.debug(`https://api.github.com/repos/${repo.full_name}/issues/${issue_number}/comments?per_page=${PER_PAGE}`);
        fetch(`https://api.github.com/repos/${repo.full_name}/issues/${issue_number}/comments?per_page=${PER_PAGE}`)
            .then((response) => response.json())
            .then((data) => {
                //console.debug(data); // Prints result from `response.json()` in getRequest
                for (let i = 0; i < data.length; i++) {
                    let comment = {
                        body: data[i].body,
                        created_at: data[i].created_at,
                        user_login: data[i].user?.login,
                    };
                    repo.issues.find((e) => e.number === issue_number).comments.push(comment);
                }
                fetch_count--;
                if (fetch_count === 0) {
                    afterFetch();
                }
            })
            .catch((error) => console.error(error));
    }

    function fetchIssues(current_page = 1) {
        //console.debug(`https://api.github.com/repos/${repo.full_name}/issues?per_page=${PER_PAGE}&page=${current_page}`);
        fetch(`https://api.github.com/repos/${repo.full_name}/issues?per_page=${PER_PAGE}&page=${current_page}`)
            .then((response) => response.json())
            .then((data) => {
                //console.debug(data); // Prints result from `response.json()` in getRequest
                for (let i = 0; i < data.length; i++) {
                    let issue = {
                        body: data[i].body,
                        comments_count: data[i].comments,
                        created_at: data[i].created_at,
                        html_url: data[i].html_url,
                        is_pr: typeof data[i].pull_request !== 'undefined',
                        number: data[i].number,
                        state: data[i].state,
                        title: data[i].title,
                        user_login: data[i].user?.login,
                    };
                    if (issue.is_pr === true) {
                        issue.reviews = [];
                        fetch_count++;
                        fetchReviews(issue.number);
                    }
                    if (issue.comments_count > 0) {
                        issue.comments = [];
                        for (let page = 1; page <= Math.floor(issue.comments_count / PER_PAGE) + 1; page++) {
                            fetch_count++;
                            fetchComments(issue.number, page);
                        }
                    }
                    repo.issues.push(issue);
                }
                fetch_count--;
                if (repo.open_issues_count === Object.keys(repo.issues).length && fetch_count === 0) {
                    afterFetch();
                }
            })
            .catch((error) => console.error(error));
    }

    function fetchRepo() {
        //console.debug(`https://api.github.com/repos/${repo.full_name}`)
        fetch(`https://api.github.com/repos/${repo.full_name}`)
            .then((response) => response.json())
            .then((data) => {
                //console.debug(data) // Prints result from `response.json()` in getRequest
                repo.has_issues = data.has_issues;
                repo.open_issues_count = data.open_issues_count;
                if (repo.has_issues) {
                    repo.issues = [];
                    for (let page = 1; page <= Math.floor(repo.open_issues_count / PER_PAGE) + 1; page++) {
                        fetch_count++;
                        fetchIssues(page);
                    }
                } else {
                    afterFetch();
                }
            })
            .catch((error) => console.error(error));
    }

    function jsonToMarkdown() {
        let md = '';

        md += `# [${repo.full_name}](${repo.html_url})\n\n`;
        md += `> number of open issues: ${repo.open_issues_count}\n\n`;

        for (let i in repo.issues) {
            let issue = repo.issues[i];
            md += `## ${issue.is_pr ? 'PR' : 'Issue'} ${issue.number} - [${issue.title}](${issue.html_url})\n\n`;
            md += `> state: ${issue.state} opened by: ${issue.user_login} on: ${issue.created_at}\n\n`;
            md += `${issue.body}\n\n`;

            if (issue.reviews?.length) {
                md += `### Reviews\n\n`;

                for (let r in issue.reviews) {
                    let review = issue.reviews[r];
                    md += `> from: ${review.user_login} on: ${review.submitted_at}\n\n`;
                    md += `${review.body}\n\n`;

                    if (review.comments?.length) {
                        md += `#### Comments\n\n`;

                        for (let c in issue.comments) {
                            let comment = issue.comments[c];
                            md += `> from: ${comment.user_login} on: ${comment.created_at}\n\n`;
                            md += `${comment.body}\n\n`;
                        }
                    }
                }
            }

            if (issue.comments_count > 0) {
                md += `### Comments\n\n`;

                for (let c in issue.comments) {
                    let comment = issue.comments[c];
                    md += `> from: ${comment.user_login} on: ${comment.created_at}\n\n`;
                    md += `${comment.body}\n\n`;
                }
            }
            md += `---\n\n`;
        }

        return md;
    }

    function render(markdown) {
        const HTML5_BEGIN = `
<!DOCTYPE html>
<html lang="en" data-color-mode="dark" data-light-theme="light" data-dark-theme="${theme_light ? 'light' : 'dark'}">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>${GM_getResourceText('PRIMER_CSS')}</style>
    <style>${GM_getResourceText(theme_light ? 'PRIMER_CSS_SYNTAX_LIGHT' : 'PRIMER_CSS_SYNTAX_DARK')}</style>
    <title>Issues - ${repo.full_name}</title>
</head>
<body>
    <div id="readme" class="Box md js-code-block-container Box--responsive">
		<div data-target="readme-toc.content" class="Box-body px-5 pb-5">
	    	<article class="markdown-body entry-content container-lg" itemprop="text">
        `;
        const HTML5_END = `
            </article>
        </div>
    </div>
</body>
</html>
        `;
        let fetch_init = {
            method: 'POST',
            header: {
                accept: 'application/vnd.github.v3+json',
            },
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mode: 'markdown',
                text: markdown,
            }),
        };

        fetch(`https://api.github.com/markdown`, fetch_init)
            .then((response) => response.text())
            .then((data) => {
                let blobrend = new Blob([`${HTML5_BEGIN}\n${data}\n${HTML5_END}`], {
                    type: 'text/plain;charset=utf-8',
                });
                window.saveAs(blobrend, `${GH_OWNER}_${GH_REPO}_issues_rendered.html`);
            })
            .catch((err) => {
                alert(err);
            });
    }

    fetchRepo();
}

init();
