
import {noop as css} from "../utils/template-noop.js"
export default ({debug}: {debug: boolean}) => css`

* {
	margin: 0;
	padding: 0;
}

html {
	font-size: 21px;
	color: white;
	background: #181818;
	font-family: "Titillium Web", sans-serif;
	background: linear-gradient(to bottom right, #282828, #000)
}

html, body {
	min-height: 100%;
}

body {
	margin: auto;
	padding: 10%;
	padding-top: 3em;
	padding-bottom: 1em;
	max-width: 960px;
	text-align: center;
}

h1 img {
	width: 100%;
	max-width: 420px;
}

p {
	font-size: 0.7em;
	color: #888;
}

a {
	color: #f90;
	text-decoration: none;
}

a:hover {
	color: #fc0;
	text-decoration: none;
}

`
