import { useTranslation } from "react-i18next";
import "./Header.css";

const Header = () => {
	const { t } = useTranslation();

	return (
		<header className="header">
			<div className="container">
				<div>
					<h1>{t('header.primaryTitle')}</h1>
				</div>
				<div>
					<p>{t('header.secondaryTitle')}</p>{" "}
				</div>
			</div>
		</header>
	);
};

export default Header;
