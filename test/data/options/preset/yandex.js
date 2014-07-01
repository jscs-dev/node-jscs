// Code taken from yandex/csp-tester Copyright (C) Yandex
// License: https://github.com/yandex/csp-tester/blob/master/LICENSE
var directives = [
    'default-src',
    'script-src',
    'object-src',
    'style-src',
    'img-src',
    'media-src',
    'frame-src',
    'font-src',
    'connect-src',
    'sandbox',
    'report-uri'
    ];

var keywords = ['self', 'unsafe-inline', 'unsafe-eval'];

// http://www.w3.org/TR/CSP/#parsing
function parse_policy(policy) {
    var result = {};
    var chunks = policy.split(';');
    var tmp;
    for (var i = 0; i < chunks.length; i++) {
        for (var j = 0; j < directives.length; j++) {
            tmp = chunks[i].split(directives[j] + ' ');
            if (tmp.length > 1) {
                result[directives[j]] = tmp[1].trim();
                break;
            }
        }
    }
    return result;
}

function save_policy() {
    var policies = [];
    var csp_value = '';
    var csp_chunks = {};
    var tmp_value = '';
    localStorage.target = document.getElementById('target').value;

    if (localStorage.getItem('mode') == 2) {
        localStorage.policy = document.getElementById('policy').value;
        csp_chunks = parse_policy(localStorage.policy);
        for (var i = 0;i < directives.length; i++) {
            if (directives[i] in csp_chunks) {
                localStorage[directives[i]] = csp_chunks[directives[i]];
            } else {
                localStorage[directives[i]] = '';
            }
        }
    } else {
        for (var i = 0; i < directives.length; i++) {
            tmp_value = document.getElementById(directives[i]).value;
            for (var j = 0; j < keywords.length; j++) {
                tmp_value = tmp_value.replace('\'' + keywords[j] + '\'', '');
                if (document.getElementById(directives[i] + '-' + keywords[j])
                        && document.getElementById(directives[i] + '-' + keywords[j]).checked) {
                    tmp_value += ' \'' + keywords[j] + '\'';
                }
            }
            localStorage.setItem(directives[i], tmp_value.trim());
            if (localStorage[directives[i]]) {
                csp_value += directives[i] + ' ' + localStorage[directives[i]] + '; ';
            }
        }
        if (csp_value) {
            csp_value = csp_value.slice(0, csp_value.length - 2);
        }
        localStorage.policy = csp_value;
    }

    if (document.getElementById('state').checked) {
        localStorage.state = 1;
    } else {
        localStorage.state = 0;
    }
    if (document.getElementById('report_only').checked) {
        localStorage.report_only = 1;
    } else {
        localStorage.report_only = 0;
    }
    var status = document.getElementById('status');
    var bg = chrome.extension.getBackgroundPage();
    if (bg.reload()) {
        status.innerHTML = 'Policy has been saved.';
        status.style.display = 'block';
    } else {
        status.innerHTML = 'Policy has not been saved! Please, check URL pattern.';
        status.style.display = 'block';
        localStorage.state = 0;
        document.getElementById('state').checked = false;
    }
    setTimeout(function () {
        status.style.display = 'none';
    }, 850);
}

function load_policy() {
    var tmp_value = '';

    if (localStorage.getItem('target')) {
        document.getElementById('target').value = localStorage.getItem('target');
    }

    if (localStorage.getItem('policy')) {
        document.getElementById('policy').value = localStorage.getItem('policy');
    }
    for (var i = 0; i < directives.length; i++) {
        if (localStorage.getItem(directives[i])) {
            tmp_value = localStorage.getItem(directives[i]);
            for (var j = 0; j < keywords.length; j++) {
                if (tmp_value.indexOf('\'' + keywords[j] + '\'') > -1
                        && document.getElementById(directives[i] + '-' + keywords[j])) {
                    tmp_value = tmp_value.replace('\'' + keywords[j] + '\'', '');
                    document.getElementById(directives[i] + '-' + keywords[j]).checked = true;
                }
            }
            document.getElementById(directives[i]).value = tmp_value.trim();
        }
    }
}

function toggle_view() {
    var adv = document.getElementById('advanced');
    var advanced_link = document.getElementById('advanced_link');
    var simple_link = document.getElementById('simple_link');
    var simple = document.getElementById('simple');

    if (localStorage.getItem('mode') == 1) {
        advanced_link.style.display = 'inline';
        adv.style.display = 'none';
        simple_link.style.display = 'none';
        simple.style.display = 'block';
    } else {
        advanced_link.style.display = 'none';
        adv.style.display = 'block';
        simple_link.style.display = 'inline';
        simple.style.display = 'none';
    }
}

function switch2advanced() {
    localStorage.mode = 2;
    var csp_value = '';
    var tmp_value = '';

    for (var i = 0; i < directives.length; i++) {
        tmp_value = document.getElementById(directives[i]).value.trim();
        for (var j = 0; j < keywords.length; j++) {
            if (document.getElementById(directives[i] + '-' + keywords[j])
                    && document.getElementById(directives[i] + '-' + keywords[j]).checked) {
                tmp_value = tmp_value.replace('\'' + keywords[j] + '\'', '');
                tmp_value += ' \'' + keywords[j] + '\'';
            }
        }
        if (tmp_value) {
            csp_value += directives[i] + ' ' + tmp_value + '; ';
        }
    }
    if (csp_value) {
        csp_value = csp_value.slice(0, csp_value.length - 2);
    }
    document.getElementById('policy').value = csp_value;
    toggle_view();
}

function switch2simple() {
    localStorage.mode = 1;
    var csp_chunks = parse_policy(document.getElementById('policy').value);
    var tmp_value = '';
    for (var i = 0; i < directives.length; i++) {
        if (directives[i] in csp_chunks) {
            tmp_value = csp_chunks[directives[i]];
            for (var j = 0; j < keywords.length; j++) {
                if (tmp_value.indexOf('\'' + keywords[j] + '\'') > -1
                        && document.getElementById(directives[i] + '-' + keywords[j])) {
                    tmp_value = tmp_value.replace('\'' + keywords[j] + '\'', '');
                    document.getElementById(directives[i] + '-' + keywords[j]).checked = true;
                }
            }
            document.getElementById(directives[i]).value = tmp_value.trim();
        } else {
            document.getElementById(directives[i]).value = '';
        }
    }
    toggle_view();
}

document.addEventListener('DOMContentLoaded', load_policy);
document.querySelector('#save').addEventListener('click', save_policy);
document.querySelector('#save').addEventListener('click', save_policy);
document.querySelector('#advanced_link').addEventListener('click', switch2advanced);
document.querySelector('#simple_link').addEventListener('click', switch2simple);

toggle_view();
