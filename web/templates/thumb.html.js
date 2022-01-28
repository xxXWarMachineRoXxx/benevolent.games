import { noop as html } from "../utils/template-noop.js";
import headBasicsHtml from "../partials/head-basics.html.js";
export default ({ debug }) => html `

<!doctype html>
<html>
<head class=thumb>
	${headBasicsHtml({ title: "thumb - benevolent" })}
	<script defer type=importmap-shim src="/importmap.json"></script>
	<script defer type=module-shim src="/thumbtastic/thumbtastic.js"></script>
	<script defer src="/node_modules/es-module-shims/dist/es-module-shims.js"></script>
	<style>
		thumb-stick {
			opacity: 0.8;
			margin: auto;
			width: 15em;
			height: 15em;
		}
	</style>
</head>
<body>
	<h1>thumbtastic dev page</h1>
	<thumb-stick></thumb-stick>
</body>
</html>

`;
//# sourceMappingURL=thumb.html.js.map