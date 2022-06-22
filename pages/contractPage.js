import { useRouter } from "next/router";

const ContractPage = (props) => {
  const router = useRouter();
  const contract = router.query;

  return (
    <div>
      <h1>{contract.name}</h1>
    </div>
  );
};

export default ContractPage;
