import { LoaderCircle } from "lucide-react";

const BiLoader = ({size}) => {
  return (
    <LoaderCircle size={size} className="animate-spin inline-block"/>
  )
}

export default BiLoader