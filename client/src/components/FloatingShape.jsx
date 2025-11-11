import {motion} from "framer-motion"

const FloatingShape = ({color, size, top, left, delay}) => {
  return (
    <motion.div
        className={`absolute ${top} ${left} ${size} ${color} rounded-full blur-xl`}
        animate={{
            x: ["0%", "100%", "0%"],
            y: ["0%", "100%", "0%"],
            rotate: [0, 360]
        }}
        transition={{
            delay: delay,
            ease: "linear",
            duration: 20,
            repeat: Infinity
        }}
        aria-hidden='true'
    >

    </motion.div>
  )
}

export default FloatingShape