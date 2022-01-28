import { noop as css } from "../utils/template-noop.js";
export default () => css `

.home {
	margin: auto;
	max-width: 960px;
	padding-bottom: 10em;
}

.home h1 {
	line-height: 0;
	margin-bottom: 1rem;
	text-align: center;
}

.home h1 .logo {
	aspect-ratio: 1 / 1;
	max-width: 10rem;
	margin: auto;
}

.home h1 img {
	display: block;
	width: 100%;
	margin: auto;
}

.home h1 span {
	opacity: 0.8;
	font-size: 0.5em;
	text-shadow: 0 0 0.4em rgba(255, 255, 255, 0.5);
	font-style: italic;
}

.home h2 {
	font-size: 2em;
	color: white;
}

.home h3 {
	font-size: 1.5em;
	color: white;
}

.home h4 {
	font-size: 1em;
	color: #ccc;
}

.home main > * + div {
	margin-top: 1em;
}

.home .gamegrid {
	list-style: none;
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: center;
	margin-top: 4em;
	text-align: center;
}

.home .gamegrid li {
	position: relative;
	width: 10em;
	padding: 0.2em;
	cursor: pointer;
	display: flex;
	flex-direction: column;
	transform: scale(0.95);
	transition: transform 200ms ease;
}

@media (max-width: 510px) {
	.home .gamegrid li {
		width: 6em;
	}
}

.home .gamegrid li:hover,
.home .gamegrid li:focus {
	transform: scale(1);
}

.home .gamegrid li > * {
	flex: 0 0 auto;
}

.home .gamegrid .poster {
	position: relative;
}

.home .gamegrid .poster::before {
	z-index: 1;
	position: absolute;
	content: "";
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	color: white;
	background: no-repeat url("/assets/website/play.svg");
	background-position: center center;
	background-size: 3em;
	filter: invert(1) drop-shadow(0px 0px 5px rgba(0, 0, 0, 80%)) opacity(50%);
	transition: all 200ms ease;
}

.home .gamegrid li:hover .poster::before,
.home .gamegrid li:focus .poster::before {
	background-size: 4em;
	filter: invert(1) drop-shadow(0px 0px 5px rgba(0, 0, 0, 80%)) opacity(100%);
}

.home .gamegrid li:active .poster::before {
	background-size: 3.5em;
	filter: invert(1) drop-shadow(0px 0px 5px rgba(0, 0, 0, 80%)) opacity(75%);
}

.home .gamegrid img {
	display: block;
	width: 100%;
	box-shadow: 0 0.2em 1em 0.5em #0006;
	border-radius: 0.3em;
}

.home .gamegrid .title {
	flex: 1 0 auto;
	z-index: 1;
	position: relative;
}

.home .gamegrid[data-high-quality="true"] li::before {
	content: "HQ ENABLED";
	display: block;
	position: absolute;
	z-index: 1;
	top: 0.5em;
	right: 0.5em;
	font-size: 0.6em;
	padding: 0.5em;
	background: #9100b644;
	border-radius: 0.5em;
	font-family: sans-serif;
	font-weight: bold;
}

.home .qualityselector {
	margin-top: 3em;
	text-align: center;
}

.home .qualityselector span {
	opacity: 0.6;
	font-size: 0.7em;
}

.home .qualityselector span em {
	opacity: 0.6;
}

.home main > hr {
	width: 50%;
	width: calc(50% - 1em);
	margin: 3em auto;
	height: 2px;
	border: none;
	background: #fff2;
}

.home section {
	margin: 1em;
}

.home section > * + * {
	margin-top: 0.6rem;
}

.home section p {
	max-width: 32rem;
}

.home .explaingrid {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	justify-content: center;
	gap: 0.5em;
	padding: 0 1em;
}

.home .explaingrid > div {
	flex: 1 1 16em;
	max-width: 24em;
	padding: 1em;
	border: 1px solid #fff2;
	border-radius: 0.5em;
}

.home .explaingrid > div > * + * {
	margin-top: 0.2em;
}

.home main > footer {
	max-width: 32em;
	margin: auto;
	text-align: center;
}

`;
//# sourceMappingURL=home.css.js.map