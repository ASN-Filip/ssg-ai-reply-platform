import React from 'react'

type FooterProps = {
  companyName?: string
}

const Footer = ({ companyName = "Samsung Electronics" }: FooterProps) => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-100 text-black py-4 " aria-label="Footer">
      <div className="container mx-auto text-center">
        <p>&copy; {currentYear} {companyName}. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
