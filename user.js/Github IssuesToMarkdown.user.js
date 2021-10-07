// ==UserScript==
// @name          Github IssuesToMarkdown
// @namespace     https://github.com/kevingrillet
// @author        Kevin GRILLET
// @description   Export Issues
// @copyright     https://github.com/kevingrillet
// @license       GPL-3.0 License
// @version       0.2

// @homepageURL   https://github.com/kevingrillet/Userscripts/
// @supportURL    https://github.com/kevingrillet/Userscripts/issues
// @downloadURL   https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/Github%20IssuesToMarkdown.user.js
// @updateURL     https://raw.githubusercontent.com/kevingrillet/Userscripts/main/user.js/Github%20IssuesToMarkdown.user.js

// @match         https://github.com/*/*/issues
// @icon          https://www.google.com/s2/favicons?domain=github.com
// @require       https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.4/FileSaver.min.js
// @run-at        document-end
// ==/UserScript==

"use strict";

var repo;

function init() {
    // Create parent div in bar
    var e = document.querySelector(".js-check-all-container").firstElementChild.appendChild(document.createElement("div"));
    e.className = "ml-3 d-flex flex-justify-between width-full width-md-auto";
    // Create btn
    e = e.appendChild(document.createElement("div"));
    e.className = "btn btn-primary";
    e.onclick = run;
    // Create span in btn
    e = e.appendChild(document.createElement("span"));
    e.className = "d-none d-md-block";
    e.innerText = "Export";
}

function jsonToMarkdown() {
    let md = "";

    md += `# [${repo.full_name}](${repo.html_url})\n\n`;
    md += `> number of open issues: ${repo.open_issues_count}\n\n`;

    for (let i in repo.issues) {
        let issue = repo.issues[i];
        md += `## ${issue.is_pr?"PR":"Issue"} ${issue.number} - [${issue.title}](${issue.html_url})\n\n`;
        md += `> state: ${issue.state} opened by: ${issue.user_login} on: ${issue.created_at}\n\n`;
        md += `${issue.body}\n\n`;

        if (issue.comments_count > 0) {
            md += `### Comments\n\n`;

            for (let c in issue.comments) {
                let comment = issue.comments[c];
                md += `---\n\n`;
                md += `> from: ${comment.user_login} on: ${comment.created_at}\n\n`;
                md += `${comment.body}\n\n`;
            }
        }
        md += `---\n\n`;
    }

    return md;
}

function run() {
    const GH_OWNER = window.location.pathname.split("/")[1];
    const GH_REPO = window.location.pathname.split("/")[2];
    const PER_PAGE = 100;

    var fetch_count = 0;

    repo = {
        full_name: `${GH_OWNER}/${GH_REPO}`,
        html_url: `https://github.com/${GH_OWNER}/${GH_REPO}`
    };

    function afterFetch() {
        //console.debug(repo);
        // Dev Export Json
        //let blobjson = new Blob([JSON.stringify(repo)], {type: "application/json"});
        //window.saveAs(blobjson, `${GH_OWNER}_${GH_REPO}_issues.json`);
        let md = jsonToMarkdown();
        let blobmd = new Blob([md], {
            type: "text/plain;charset=utf-8"
        });
        window.saveAs(blobmd, `${GH_OWNER}_${GH_REPO}_issues.md`);

        render(md);
    }

    function fetchComments(issue_number, current_page = 1) {
        //console.debug(`https://api.github.com/repos/${repo.full_name}/issues/${issue_number}/comments?per_page=${PER_PAGE}&page=${current_page}`);
        fetch(`https://api.github.com/repos/${repo.full_name}/issues/${issue_number}/comments?per_page=${PER_PAGE}&page=${current_page}`)
            .then(response => response.json())
            .then(data => {
            //console.debug(data); // Prints result from `response.json()` in getRequest
            for (let i = 0; i < data.length; i++) {
                let comment = {
                    body: data[i].body,
                    created_at: data[i].created_at,
                    user_login: data[i].user?.login
                };
                repo.issues.find(e => e.number == issue_number).comments.push(comment);
            }
            fetch_count--;
            if (fetch_count == 0) {
                afterFetch();
            }
        })
            .catch(error => console.error(error));
    }

    function fetchIssues(current_page = 1) {
        //console.debug(`https://api.github.com/repos/${repo.full_name}/issues?per_page=${PER_PAGE}&page=${current_page}`);
        fetch(`https://api.github.com/repos/${repo.full_name}/issues?per_page=${PER_PAGE}&page=${current_page}`)
            .then(response => response.json())
            .then(data => {
            //console.debug(data); // Prints result from `response.json()` in getRequest
            for (let i = 0; i < data.length; i++) {
                let issue = {
                    body: data[i].body,
                    comments_count: data[i].comments,
                    created_at: data[i].created_at,
                    html_url: data[i].html_url,
                    is_pr: (typeof data[i].pull_request !== "undefined"),
                    number: data[i].number,
                    state: data[i].state,
                    title: data[i].title,
                    user_login: data[i].user?.login
                };
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
            if (repo.open_issues_count = repo.issues.length && fetch_count == 0) {
                afterFetch();
            }
        })
            .catch(error => console.error(error))
    }

    function fetchRepo() {
        //console.debug(`https://api.github.com/repos/${repo.full_name}`)
        fetch(`https://api.github.com/repos/${repo.full_name}`)
            .then(response => response.json())
            .then(data => {
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
            .catch(error => console.error(error))
    }

    function render(markdown) {
        let fetch_init = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "mode": "markdown",
                "text": markdown
            })
        };
        fetch(`https://api.github.com/markdown`, fetch_init)
            .then(response => response.text())
            .then(data => {
            let blobrend = new Blob([data], {
                type: "text/plain;charset=utf-8"
            });
            window.saveAs(blobrend, `${GH_OWNER}_${GH_REPO}_issues_rendered.html`);
        })
            .catch(err => {
            alert(err);
        });
    }

    fetchRepo();
}

init();