import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  useDisclosure,
  Button,
} from "@chakra-ui/react";
import React, { useRef, useState } from "react";
import axios from "axios";

const PrintActionModal = ({ order, setOrders }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [error, setError] = useState(false);

  const markAsPrinted = async () => {
    try {
      await axios
        .post(`${process.env.REACT_APP_API_URL}/api/v1/order/update`, {
          id: order._id,
          isTriggered: true,
        })
        .then((res) => {
          // setOrders(res.data.latestOrders);
          // console.log("res", res.data.latestOrders);
        })
        .catch((err) => console.log(err.message));
    } catch (error) {
      setError(true);
      setTimeout(() => {
        setError(false);
      }, 2000);
    }
    onClose();
  };

  const printAgain = async () => {
    markAsPrinted();
    onClose();
  };

  return (
    <>
      {error ? (
        <div
          className="alert alert-danger fixed z-10 top-0 w-full font-semibold text-sm md:text-md"
          role="alert"
        >
          !! Server Problem !!
        </div>
      ) : null}

      <Button onClick={onOpen}>Print</Button>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>Print Actions</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            What do you want to do mark as printed or print again? Choose
            appropriate option
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button colorScheme="orange" ml={3} onClick={markAsPrinted}>
              Mark as Printed
            </Button>
            <Button
              colorScheme="green"
              onClick={printAgain}
              className="text-decoration-none"
              as={"a"}
              href={`readytoprint:${order.docUrl}#copies=${order.noOfCopies}#color=${order.grayOrColored}#size=${order.pageSizeFormat}#double=${order.pageSides}`}
              ml={3}
            >
              Print Again
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PrintActionModal;
