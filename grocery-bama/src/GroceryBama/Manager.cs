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
    public partial class Manager : Form
    {
        List<USER> users = new List<USER>();
        List<SYSTEMINFORMATION> sysinfo = new List<SYSTEMINFORMATION>();
        List<GROCERYSTORE> stores = new List<GROCERYSTORE>();
        USER addUser = new USER();
        MANAGES addManages = new MANAGES();
        
        public Manager()
        {
            InitializeComponent();
            LoadAll();
            LoadCombo();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            this.Close();
        }

        private void button2_Click(object sender, EventArgs e)
        {

            if (String.IsNullOrWhiteSpace(textEmail.Text))
            {
                MessageBox.Show("Please enter an email address.");
                return;
            }

            if (String.IsNullOrWhiteSpace(textFirst.Text))
            {
                MessageBox.Show("Please enter a first name.");
                return;
            }

            if (String.IsNullOrWhiteSpace(textLast.Text))
            {
                MessageBox.Show("Please enter a last name.");
                return;
            }

            if (String.IsNullOrWhiteSpace(textPassword.Text))
            {
                MessageBox.Show("Please enter a password.");
                return;
            }
            if (String.IsNullOrWhiteSpace(textConfirmationCode.Text))
            {
                MessageBox.Show("Please enter a confirmation code.");
                return;
            }
            if (String.IsNullOrWhiteSpace(textPhone.Text))
            {
                MessageBox.Show("Please enter a phone number.");
                return;
            }
            bool validCode = false;
            foreach (var item in sysinfo)
            {
                //MessageBox.Show(item.user_codes);
                if (item.user_codes == textConfirmationCode.Text) validCode = true;
            }
            if (!validCode)
            {
                MessageBox.Show("Please enter a valid code.");
                return;
            }
            foreach (var item in users)
            {
                if (item.username == textUsername.Text)
                {
                    MessageBox.Show("Your username is taken.");
                    return;
                }
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

            if (!textEmail.Text.Contains("@") || !textEmail.Text.Contains("."))
            {
                MessageBox.Show("Invalid email address.");
                return;
            }
            /*addUser.username = textUsername.Text;
            addUser.password = textPassword.Text;
            addUser.first_name = textFirst.Text;
            addUser.last_name = textLast.Text;
            addUser.email = textEmail.Text;
            addUser.user_type = "manager";
            addManages.username = textUsername.Text;*/

            string address_store = comboAssignStore.Text.Split('-')[0];
            address_store.Trim();

            //MessageBox.Show(address_store);
            //addManages.store_address = Int32.Parse(address_store);
            string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
            using (SqlConnection _con = new SqlConnection(connectionString))
            {
                string query = "INSERT INTO [GROCERYBAMA1].[dbo].[USER] VALUES (@username, @password, 'manager', @email, @first_name, @last_name);";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.AddWithValue("@username", textUsername.Text);
                    command.Parameters.AddWithValue("@password", textPassword.Text);
                    command.Parameters.AddWithValue("@email", textEmail.Text);
                    command.Parameters.AddWithValue("@first_name", textFirst.Text);
                    command.Parameters.AddWithValue("@last_name", textLast.Text);

                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }
                query = "INSERT INTO [GROCERYBAMA1].[dbo].[MANAGES] VALUES (@username, @store_address);";
                using (SqlCommand command = new SqlCommand(query, _con))
                {
                    command.Parameters.AddWithValue("@username", textUsername.Text);
                    command.Parameters.AddWithValue("@store_address", Int32.Parse(address_store));

                    _con.Open();
                    int result = command.ExecuteNonQuery();
                    _con.Close();

                    if (result < 0)
                        MessageBox.Show("There was an error.");
                }
            }
            MessageBox.Show("Successfully registered manager.");
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
                queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[systeminformation]";

                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        SYSTEMINFORMATION add = new SYSTEMINFORMATION();
                        add.system_id = Int32.Parse(dr["system_id"].ToString());
                        add.user_codes = dr["user_codes"].ToString();
                        sysinfo.Add(add);
                    }
                }
                queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[grocerystore]";

                using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                {
                    DataTable tb = new DataTable();

                    SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                    _con.Open();
                    _dap.Fill(tb);
                    _con.Close();
                    foreach (DataRow dr in tb.Rows)
                    {
                        GROCERYSTORE addStore = new GROCERYSTORE();
                        addStore.store_id = Int32.Parse(dr["store_id"].ToString());
                        addStore.store_name = dr["store_name"].ToString();
                        addStore.phone = dr["phone"].ToString();
                        addStore.address_id = Int32.Parse(dr["address_id"].ToString());
                        addStore.opening_time = dr["opening_time"].ToString();
                        addStore.closing_time = dr["closing_time"].ToString();
                        stores.Add(addStore);
                    }
                }
            }
        }
        private void LoadCombo()
        {
            foreach(var item in stores)
            {
                string addToCombo = "";
                addToCombo += item.address_id;
                addToCombo += " - ";
                addToCombo += item.store_name;
                comboAssignStore.Items.Add(addToCombo);
            }
        }
    }
}
