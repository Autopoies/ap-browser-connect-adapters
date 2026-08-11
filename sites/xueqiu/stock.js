(() => {
	const isLoginOverlay = Boolean(
		document.querySelector(
			'input[type="password"], form[action*="login"], .login-box, .modal-login',
		),
	);
	const body = document.body?.innerText || "";
	if (isLoginOverlay && body.length < 400) return [];
	const pick = (sels) =>
		sels
			.map((s) => document.querySelector(s)?.textContent?.trim())
			.find(Boolean) || "";
	const name =
		pick([".stock-name", ".quote-name", "h1"]) ||
		body.match(/([^\n]+\(SH:\d+\)|[^\n]+\([A-Z]+:\w+\))/)?.[1] ||
		document.title.split(/[_-]/)[0].trim();
	const price =
		pick([".stock-current", ".current", '[class*="price"]']) ||
		body.match(/[¥$]?\d+(?:\.\d+)?/)?.[0] ||
		"";
	const move = body.match(/([+-]\d+(?:\.\d+)?)\s+([+-]\d+(?:\.\d+)?%)/);
	const change =
		pick([".stock-change", ".change", '[class*="change"]']) || move?.[1] || "";
	const percent =
		pick([".stock-change-percent", ".percent", '[class*="percent"]']) ||
		move?.[2] ||
		"";
	if (!name && !price) return [];
	return [{ symbol: "{{args.symbol}}", name, price, change, percent }];
})();
