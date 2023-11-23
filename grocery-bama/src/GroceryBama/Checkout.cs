using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Data.SqlClient;

namespace GroceryBama
{
    public partial class Checkout : Form
    {
        List<PAYMENT> payments = new List<PAYMENT>();
        List<int> order_ids = new List<int>();
        List<USER> deliverers = new List<USER>();
        USER persistent_deliverer = new USER();
        int orderId = 0;
        int totalItems = 0;
        public Checkout()
        {
            InitializeComponent();
            LoadAll();
        }

        private void button_finalize_Click(object sender, EventArgs e)
        {
            foreach(var i in order_ids)
            {
                if (i > orderId) orderId = i;
            }
            orderId++;
            if (String.IsNullOrWhiteSpace(comboDeliveryTime.Text))
            {
                MessageBox.Show("Please enter a time for delivery.");
                return;
            }

            if (String.IsNullOrWhiteSpace(comboPaymentType.Text))
            {
                MessageBox.Show("Please enter a payment type.");
                return;
            }
            persistent_deliverer = deliverers.OrderBy(x => Guid.NewGuid()).FirstOrDefault();
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string query = "INSERT INTO [GROCERYBAMA1].[dbo].[ORDERR] VALUES (@order_id, @delivery_instructions, @delivery_time, @current_date, @current_time);";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    if (String.IsNullOrWhiteSpace(textDeliveryInstructions.Text))
                    {
                        command.Parameters.Add("@delivery_instructions", SqlDbType.VarChar).Value = "NULL";
                    }
                    else
                    {
                        command.Parameters.Add("@delivery_instructions", SqlDbType.VarChar).Value = textDeliveryInstructions.Text;
                    }
                    command.Parameters.Add("@order_id", SqlDbType.Int).Value = orderId;
                    command.Parameters.Add("@delivery_time", SqlDbType.VarChar).Value = comboDeliveryTime.Text;
                    command.Parameters.Add("@current_date", SqlDbType.VarChar).Value = DateTime.Now.ToString("yyyy-MM-dd");
                    command.Parameters.Add("@current_time", SqlDbType.VarChar).Value = DateTime.Now.ToString("HH:mm");
                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }
                query = "INSERT INTO [GROCERYBAMA1].[dbo].[ORDERFROM] VALUES (@store_id, @order_id);";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@order_id", SqlDbType.Int).Value = orderId;
                    command.Parameters.Add("@store_id", SqlDbType.Int).Value = Globals.Chosen_Store.store_id;
                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }
                query = "INSERT INTO [GROCERYBAMA1].[dbo].[ORDERED_BY] VALUES (@order_id, @username);";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@order_id", SqlDbType.Int).Value = orderId;
                    command.Parameters.Add("@username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;

                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }
                query = "INSERT INTO [GROCERYBAMA1].[dbo].[DELIVEREDBY] VALUES (@order_id, @deliverer_username, '0', NULL, NULL);";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@order_id", SqlDbType.Int).Value = orderId;
                    command.Parameters.Add("@deliverer_username", SqlDbType.VarChar).Value = persistent_deliverer.username;
                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }
                foreach (var item in Globals.cart)
                {
                    query = "INSERT INTO [GROCERYBAMA1].[dbo].[SELECTITEM] VALUES (@item_id, @quantity, @order_id);";
                    using (SqlCommand command = new SqlCommand(query, _con))
                    {
                        command.Parameters.Add("@item_id", SqlDbType.Int).Value = item.item_id;
                        command.Parameters.Add("@quantity", SqlDbType.Int).Value = item.quantity;
                        command.Parameters.Add("@order_id", SqlDbType.Int).Value = orderId;

                        _con.Open();
                        int result = command.ExecuteNonQuery();
                        _con.Close();

                        if (result < 0)
                            MessageBox.Show("There was an error.");
                    }
                }
                string receipt = "Order successfully submitted. Here is your receipt.\n\nOrder Number: " + orderId +"\nPayment Name: " + comboPaymentType.Text
                    + "\nDeliverer's Name: " + persistent_deliverer.first_name + "\nNumber of Items: " + totalItems + "\nTime Order Placed: " + DateTime.Now.ToString("HH:mm") + "\nTime of Delivery: " + comboDeliveryTime.Text;
                MessageBox.Show(receipt);
                Globals.cart.Clear();
                this.Close();
            }
        }
        private void LoadAll()
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[payment] where username = @username";

                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    //MessageBox.Show(Globals.Persistent_Current.username);
                    _cmd.Parameters.Add("@username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        PAYMENT addUser = new PAYMENT();
                        addUser.username = dr["username"].ToString();
                        addUser.payment_name = dr["payment_name"].ToString();
                        addUser.routing_number = dr["routing_number"].ToString();
                        addUser.account_number = dr["account_number"].ToString();
                        payments.Add(addUser);
                    }
                }
                queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[orderr]";

                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    //MessageBox.Show(Globals.Persistent_Current.username);
                    _cmd.Parameters.Add("@username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        int temp_id;
                        temp_id = Int32.Parse(dr["order_id"].ToString());
                        order_ids.Add(temp_id);
                    }
                }
                queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[user] where user_type = 'deliverer'";
                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        USER addUser = new USER();
                        addUser.first_name = dr["first_name"].ToString();
                        addUser.last_name = dr["last_name"].ToString();
                        addUser.email = dr["email"].ToString();
                        addUser.password = dr["password"].ToString();
                        addUser.username = dr["username"].ToString();
                        addUser.user_type = dr["user_type"].ToString();
                        deliverers.Add(addUser);
                    }
                }
            }
            foreach (var item in payments)
            {
                comboPaymentType.Items.Add(item.payment_name);
            }
            double totalPrice = 0;
            foreach(var item in Globals.cart)
            {
                totalPrice += item.quantity * item.listed_price;
                totalItems += item.quantity;
            }
            textTotalPrice.Text = totalPrice.ToString();
        }

        private void button_new_payment_Click(object sender, EventArgs e)
        {
            NewPayment form = new NewPayment();
            form.ShowDialog();
        }

        private void btn_refresh_Click(object sender, EventArgs e)
        {
            comboPaymentType.Items.Clear();
            payments.Clear();
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[payment] where username = @username";

                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    //MessageBox.Show(Globals.Persistent_Current.username);
                    _cmd.Parameters.Add("@username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        PAYMENT addUser = new PAYMENT();
                        addUser.username = dr["username"].ToString();
                        addUser.payment_name = dr["payment_name"].ToString();
                        addUser.routing_number = dr["routing_number"].ToString();
                        addUser.account_number = dr["account_number"].ToString();
                        payments.Add(addUser);
                    }
                }
            }
            foreach (var item in payments)
            {
                comboPaymentType.Items.Add(item.payment_name);
            }
            MessageBox.Show("Payments refreshed.");
        }

        private void button_back_Click(object sender, EventArgs e)
        {
            this.Close();
        }
    }
}
