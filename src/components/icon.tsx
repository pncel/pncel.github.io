import {
  faGlobe,
  faPaperPlane,
  faFilePdf,
  faVideo,
  faMicrochip,
  faMedal,
} from "@fortawesome/free-solid-svg-icons";
import {
  faLinkedin,
  faGithub,
  faXTwitter,
  faFacebook,
  faInstagram,
  faGoogleScholar,
  faOrcid,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { Icon } from "@/data/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SelectedFontAwesomeIcon({
  icon,
}: Readonly<{ icon: Icon }>) {
  const icons = [
    faPaperPlane,
    faFilePdf,
    faVideo,
    faGithub,
    faGlobe,
    faGoogleScholar,
    faOrcid,
    faLinkedin,
    faXTwitter,
    faInstagram,
    faFacebook,
    faYoutube,
    faMicrochip,
    faMedal,
  ];
  return <FontAwesomeIcon icon={icons[icon]} />;
}
