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
    public partial class Login : Form
    {
        List<USER> users = new List<USER>();
        List<ADDRESS> addresses = new List<ADDRESS>();
        List<BUYER> buyers = new List<BUYER>();
        List<GROCERYSTORE> stores = new List<GROCERYSTORE>();
        GROCERYSTORE temp = new GROCERYSTORE();
        public Login()
        {
            InitializeComponent();
        }

        private void Form1_Load(object sender, EventArgs e)
        {

        }

        private void button1_Click(object sender, EventArgs e)
        {
            users.Clear();
            addresses.Clear();
            buyers.Clear();
            stores.Clear();
            Globals.Persistent_Current = null;
            LoadAll();
            //MessageBox.Show(users.Count().ToString());
            bool matchFound = false;
            foreach (var item in users)
            {
                if (txtUsername.Text == item.username && txtPassword.Text == item.password)
                {
                    Globals.has_deleted = false;
                    matchFound = true;
                    Globals.Persistent_Current = item;
                    if (Globals.Persistent_Current.user_type == "deliverer" || Globals.Persistent_Current.user_type == "manager") break;
                    foreach(var item_buyer in buyers)
                    {
                        if (item.username == item_buyer.username) Globals.Persistent_Buyer = item_buyer;
                    }
                    foreach (var item_store in stores)
                    {
                        if (Globals.Persistent_Buyer.default_store_id == item_store.store_id) Globals.Persistent_Store = item_store;
                    }
                    foreach (var item_address in addresses)
                    {
                        if (Globals.Persistent_Buyer.address == item_address.id) Globals.Persistent_Address = item_address;
                        if (Globals.Persistent_Store.address_id == item_address.id) Globals.Store_Address = item_address;
                    }
                    Globals.Preferred_Credit = "N/A";
                    Globals.Preferred_Routing = "N/A";
                    BuyerFunctionality form = new BuyerFunctionality();
                    form.ShowDialog();
                    continue;
                }
            }
            if (!matchFound)
            {
                DialogResult dialog = new DialogResult();
                dialog = MessageBox.Show("Error: Invalid Login Information.", "GroceryBama Message", MessageBoxButtons.OK);
                return;
            }
            if(Globals.Persistent_Current.user_type == "deliverer")
            {
                DelivererFunctionality form = new DelivererFunctionality();
                form.ShowDialog();
            }
            else if(Globals.Persistent_Current.user_type == "manager")
            {
                string connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
                using (SqlConnection _con = new SqlConnection(connectionString))
                {
                    string queryStatement = "SELECT * FROM [GROCERYBAMA1].[dbo].[manages] where username = @username";

                    using (SqlCommand _cmd = new SqlCommand(queryStatement, _con))
                    {
                        _cmd.Parameters.Add("@username", SqlDbType.VarChar).Value = Globals.Persistent_Current.username;
                        DataTable tb = new DataTable();

                        SqlDataAdapter _dap = new SqlDataAdapter(_cmd);

                        _con.Open();
                        _dap.Fill(tb);
                        _con.Close();
                        foreach (DataRow dr in tb.Rows)
                        {
                            GROCERYSTORE addStore = new GROCERYSTORE();
                            addStore.address_id = Int32.Parse(dr["store_address"].ToString());
                            temp = addStore;
                        }
                    }
                }
                foreach (var item in stores)
                {
                    if (temp.address_id == item.address_id) Globals.Persistent_Store = item;
                }
                foreach (var item_address in addresses)
                {
                    if (Globals.Persistent_Store.address_id == item_address.id) Globals.Store_Address = item_address;
                }
                ManagerFunctionality form = new ManagerFunctionality();
                form.ShowDialog();
            }
        }

        private void button2_Click(object sender, EventArgs e)
        {
            Register form = new Register();
            form.ShowDialog();
        }

        private void button3_Click(object sender, EventArgs e)
        {
            DialogResult dialog = new DialogResult();
            dialog = MessageBox.Show("Are you sure you want to exit?", "GroceryBama Message", MessageBoxButtons.YesNo);
            if(dialog == DialogResult.Yes)
            {
                Application.Exit();
            }
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
    }
}