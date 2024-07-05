import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import openSocket from "socket.io-client";
import PrintActionModal from "../components/PrintActionModal";

let socket;

const Home = () => {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(false);

	const [dataOfLink, setDataOfLink] = useState({
		url: "",
		copies: "",
		color: "",
		size: "",
		double: "",
	});
	const linkRef = useRef();

	const [userInfo, setUserInfo] = useState({
		shopName: "",
		shopId: "",
	});

	const navigate = useNavigate();

	const handleLogout = async () => {
		localStorage.removeItem("shop");
		navigate("/login");
		socket.disconnect();
	};

	useEffect(() => {
		if (window.localStorage !== undefined) {
			const data = JSON.parse(localStorage.getItem("shop"));
			if (data) {
				setUserInfo({
					shopName: data.email,
					shopId: data.shopId,
				});
				socket = openSocket(`${process.env.REACT_APP_API_URL}`);

				socket.on("connect", () => {
					console.log("connect");
					socket.emit("join_room", { shopId: data.shopId });
				});

				socket.on("receiveOrders", (data) => {
					setLoading(true);
					setOrders(data.orders);
				});
			}
		}
	}, []);

	useEffect(() => {
		const handleAddOrder = async (data) => {
			socket.emit("updateTrigger", {
				id: data.printableData.id,
				shopId: data.printableData.shopId,
				triggered: true,
			});

			socket.on("updatedOrders", (data) => {
				setOrders(data.updatedOrders);

				setDataOfLink({
					url: data.updatedOrder.docUrl,
					copies: data.updatedOrder.noOfCopies,
					color: data.updatedOrder.grayOrColored,
					size: data.updatedOrder.pageSizeFormat,
					double: data.updatedOrder.pageSides,
				});
			});

			if (dataOfLink != null) {
				setTimeout(() => {
					linkRef.current.click();
				}, 1000);
			}
		};

		socket.on("addOrder", handleAddOrder);

		return () => {
			socket.off("addOrder", handleAddOrder);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [socket]);

	let i = 1;

	return (
		<>
			<div className=" flex justify-between p-2 items-center bg-black text-white">
				<span className="md:text-xl">RTP-Printing</span>
				<div className="flex items-center gap-x-5">
					<span className="safa">{userInfo.shopName}</span>
					<button className="btn btn-primary" onClick={handleLogout}>
						Log out
					</button>
				</div>
			</div>

			<div>
				{loading ? (
					<>
						{orders && orders.length !== 0 ? (
							<table className="table table-hover align-middle">
								<thead>
									<tr>
										<th scope="col">S.no</th>
										<th scope="col">Docs</th>
										<th scope="col">Phone</th>
										<th scope="col">Status</th>
										<th scope="col">Pages</th>
										<th scope="col">Page format</th>
										<th scope="col">GrayOrColour</th>
										<th scope="col">Copies</th>
										<th scope="col">PageSide</th>
										<th scope="col">Order Id</th>
										<th scope="col">Payment Id</th>
										<th scope="col">Amount</th>
										<th scope="col">Action</th>
									</tr>
								</thead>
								<tbody>
									{orders.map((item) => (
										<tr key={item._id}>
											<th scope="row">{item.sno}</th>
											<td>
												<Link to={`${item.docUrl}`}>View</Link>
											</td>
											<td>{item.phoneNo}</td>
											<td>{`${item.isTriggered}`}</td>
											<td>{item.noOfPages}</td>
											<td>{item.pageSizeFormat === "a3" ? "A3" : "A4"}</td>
											<td>
												{item.grayOrColored !== "0" ? "Colored" : "Grayscale"}
											</td>
											<td>{item.noOfCopies}</td>
                      <td>{item.pageSides !== "0" ? "Double" : "One"}</td>
											<td>{item.order_id}</td>
											<td>{item.payment_id}</td>
											<td>{item.amount}</td>
											<td>
												<PrintActionModal setOrders={setOrders} order={item} />
											</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<div className="absolute w-full min-h-screen flex items-center justify-center">
								<p className="md:text-lg">No data found</p>
							</div>
						)}
					</>
				) : (
					<div className=" min-h-screen w-full flex justify-center items-center bg-white">
						<div>
							<div className="spinner-border w-24 h-24" role="status">
								<span className="sr-only">Loading...</span>
							</div>
							<p className="text-lg font-bold md:text-xl mt-3">Loading..</p>
						</div>
					</div>
				)}

				<Link
					ref={linkRef}
					className={`text-decoration-none text-white absolute -z-10 ${
						dataOfLink ? "block" : "hidden"
					}`}
					to={`readytoprint:${dataOfLink.url}#copies=${dataOfLink.copies}#color=${dataOfLink.color}#size=${dataOfLink.size}#double=${dataOfLink.double}`}
				/>
			</div>
		</>
	);
};

export default Home;
