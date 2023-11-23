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
    public partial class RegisterBuyer : Form
    {
        List<USER> users = new List<USER>();
        List<BUYER> buyers = new List<BUYER>();
        List<ADDRESS> addresses = new List<ADDRESS>();
        BUYER addBuyer = new BUYER();
        USER addUser = new USER();
        ADDRESS addAddress = new ADDRESS();

        public RegisterBuyer()
        {
            InitializeComponent();
            LoadAll();
        }

        private void button2_Click(object sender, EventArgs e)
        {
            if (String.IsNullOrWhiteSpace(textAddy.Text))
            {
                MessageBox.Show("Please enter an address.");
                return;
            }

            if (String.IsNullOrWhiteSpace(textCity.Text))
            {
                MessageBox.Show("Please enter a city.");
                return;
            }

            if (String.IsNullOrWhiteSpace(textEmail.Text))
            {
                MessageBox.Show("Please enter an email address.");
                return;
            }

            if (String.IsNullOrWhiteSpace(textFirstName.Text))
            {
                MessageBox.Show("Please enter a first name.");
                return;
            }

            if (String.IsNullOrWhiteSpace(textLastName.Text))
            {
                MessageBox.Show("Please enter a last name.");
                return;
            }

            if (String.IsNullOrWhiteSpace(textPassword.Text))
            {
                MessageBox.Show("Please enter a password.");
                return;
            }

            if (String.IsNullOrWhiteSpace(textPhone.Text))
            {
                MessageBox.Show("Please enter a phone number.");
                return;
            }

            if (String.IsNullOrWhiteSpace(textState.Text))
            {
                MessageBox.Show("Please enter a state.");
                return;
            }

            if (String.IsNullOrWhiteSpace(textUser.Text))
            {
                MessageBox.Show("Please enter a username.");
                return;
            }

            if (String.IsNullOrWhiteSpace(textZip.Text))
            {
                MessageBox.Show("Please enter a zip code.");
                return;
            }

            if (String.IsNullOrWhiteSpace(textStreet.Text))
            {
                MessageBox.Show("Please enter a street.");
                return;
            }

            if (textConfirm.Text != textPassword.Text)
            {
                MessageBox.Show("Your password does not match your confirmation.");
                return;
            }

            if (textPhone.Text.Length != 10 && textPhone.Text.Length != 9)
            {
                MessageBox.Show("Phone number must be 9 or 10 digits long.");
                return;
            }

            if (textZip.Text.Length != 5)
            {
                MessageBox.Show("Your zip code must be 5 digits long.");
                return;
            }

            if (!textEmail.Text.Contains("@") || !textEmail.Text.Contains("."))
            {
                MessageBox.Show("Invalid email address.");
                return;
            }

            foreach(USER item in users)
            {
                if(item.username == textUser.Text)
                {
                    MessageBox.Show("Your username is taken.");
                    return;
                }
            }
            /*
            addUser.username = textUser.Text;
            addUser.password = textPassword.Text;
            addUser.first_name = textFirstName.Text;
            addUser.last_name = textLastName.Text;
            addUser.email = textEmail.Text;
            addUser.user_type = "buyer";
            addBuyer.default_payment = "NULL";
            addBuyer.default_store_id = 1;
            addBuyer.phone = textPhone.Text;
            addBuyer.username = textUser.Text;*/

            int addyMax = 0;

            foreach (var item in addresses)
            {
                if (item.id > addyMax) addyMax = item.id;
            }
            addyMax++;

            /*addAddress.id = addyMax;
            addBuyer.address = addyMax;
            addAddress.house_number = textAddy.Text;
            addAddress.street = textStreet.Text;
            addAddress.state = textState.Text;
            addAddress.zip_code = textZip.Text;
            addAddress.city = textCity.Text;*/

            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string query = "INSERT INTO [GROCERYBAMA1].[dbo].[USER] VALUES (@username, @password, 'buyer', @email, @first_name, @last_name);";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@username", SqlDbType.VarChar).Value = textUser.Text;
                    command.Parameters.Add("@password", SqlDbType.VarChar).Value = textPassword.Text;
                    command.Parameters.Add("@email", SqlDbType.VarChar).Value = textEmail.Text;
                    command.Parameters.Add("@first_name", SqlDbType.VarChar).Value = textFirstName.Text;
                    command.Parameters.Add("@last_name", SqlDbType.VarChar).Value = textLastName.Text;
                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }

                query = "INSERT INTO [GROCERYBAMA1].[dbo].[ADDRESS] VALUES (@id, @house_number, @street, @city, @state, @zip_code);";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@id", SqlDbType.Int).Value = addyMax;
                    command.Parameters.Add("@house_number", SqlDbType.VarChar).Value = textAddy.Text;
                    command.Parameters.Add("@street", SqlDbType.VarChar).Value = textStreet.Text;
                    command.Parameters.Add("@city", SqlDbType.VarChar).Value = textCity.Text;
                    command.Parameters.Add("@state", SqlDbType.VarChar).Value = textState.Text;
                    command.Parameters.Add("@zip_code", SqlDbType.VarChar).Value = textZip.Text;
                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }

                query = "INSERT INTO [GROCERYBAMA1].[dbo].[BUYER] VALUES (@username, @phone, @address, 'NULL', '1');";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.Add("@username", SqlDbType.VarChar).Value = textUser.Text;
                    command.Parameters.Add("@phone", SqlDbType.VarChar).Value = textPhone.Text;
                    command.Parameters.Add("@address", SqlDbType.Int).Value = addyMax;

                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }
            }
            MessageBox.Show("Successfully registered buyer.");
            this.Close();
        }
        
        private void button1_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void LoadAll()
        {
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[user]";

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
                        users.Add(addUser);
                    }
                }
                queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[buyer]";

                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        BUYER addBuyer = new BUYER();
                        addBuyer.phone = dr["phone"].ToString();
                        addBuyer.address = Int32.Parse(dr["address_id"].ToString());
                        addBuyer.default_payment = dr["default_payment"].ToString();
                        addBuyer.default_store_id = Int32.Parse(dr["default_store_id"].ToString());
                        addBuyer.username = dr["username"].ToString();
                        buyers.Add(addBuyer);
                    }
                }

                queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[address]";

                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        ADDRESS addAddress = new ADDRESS();
                        addAddress.id = Int32.Parse(dr["id"].ToString());
                        addAddress.house_number = dr["house_number"].ToString();
                        addAddress.state = dr["state"].ToString();
                        addAddress.street = dr["street"].ToString();
                        addAddress.city = dr["city"].ToString();
                        addAddress.zip_code = dr["zip_code"].ToString();
                        addresses.Add(addAddress);
                    }
                }
            }
        }
    }
}
