import { noop as html } from "../utils/template-noop.js";
export default ({ title }) => html `

<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="darkreader" content="dark"/>
<title>${title}</title>

<link rel=stylesheet href="/style.css"/>

<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=PT+Serif:ital@0;1&family=Titillium+Web:ital@0;1&display=swap" rel="stylesheet"/>

<link rel="apple-touch-icon" sizes="180x180" href="/assets/website/favicon/apple-touch-icon.png"/>
<link rel="icon" type="image/png" sizes="32x32" href="/assets/website/favicon/favicon-32x32.png"/>
<link rel="icon" type="image/png" sizes="16x16" href="/assets/website/favicon/favicon-16x16.png"/>
<link rel="manifest" href="/assets/website/site.webmanifest"/>

`;
//# sourceMappingURL=head-basics.html.js.map