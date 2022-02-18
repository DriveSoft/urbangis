import PropTypes from 'prop-types'

const Header = ({ title }) => {    
    return (
        <header className='header'>
            <h1>{title}</h1>
        </header>
    )
}


Header.defaultProps = {
    title: 'Task def tracker'
}

Header.PropsTypes = {
    title: PropTypes.string,    
}


export default Header