interface SidebarProps {
	children: JSX.Element	
}

const Sidebar = ({children}: SidebarProps) => {
	return (
		<div className="bg-light border-right" id="sidebar-wrapper">
			<div className="list-group list-group-flush" style={{ marginTop: "15px" }}>
				{children}
			</div>
		</div>
	);
};

export default Sidebar
