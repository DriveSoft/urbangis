import FacebookImg from './Footer_fb.png'
import MailImg from './Footer_mail.png'
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
        <div className="container">
            <a href="https://www.facebook.com/mitko.ivanov.14473426/" target="_blank"><img src={FacebookImg} alt="" /></a>
            <a href="mailto:drive.soft.mail@gmail.com" target="_blank"><img src={MailImg} alt="" /></a>
            <p style={{flex: "1", textAlign: "center"}}>Smart City Key 2022</p>            
        </div>
    </footer>    
  )
}

export default Footer