import { Check, X } from "lucide-react";
import { useEffect } from "react";

const PasswordStrength = ({ password, setPasswordScore }) => {
  const colors = [
    "bg-red-500",
    "bg-red-400",
    "bg-yellow-500",
    "bg-yellow-400",
    "bg-green-600",
  ];

  const criteria = [
    { label: "Longer than 6 characters", pass: password.length >= 6 },
    { label: "Contains an uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Contains a lowercase letter", pass: /[a-z]/.test(password) },
    { label: "Contains a number", pass: /[0-9]/.test(password) },
    {
      label: "Contains a special character",
      pass: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const passwordScore = criteria.filter((c) => c.pass).length;

  useEffect(() => {
    setPasswordScore(passwordScore);
  }, [passwordScore, setPasswordScore]);

  const getColor = () => colors[passwordScore - 1] || "bg-gray-500";

  return (
    <div>
      <div className="flex gap-1 mb-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className={`rounded h-1 flex-1 transition-all duration-300 ${
              passwordScore > index ? getColor() : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>

      <div className="flex flex-col text-sm italic">
        {criteria.map((item, index) => (
          <p
            key={index}
            className={`flex items-center gap-1 ${
              item.pass ? "text-green-700" : "text-gray-500"
            }`}
          >
            {item.pass ? <Check /> : <X />}
            {item.label}
          </p>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrength;
