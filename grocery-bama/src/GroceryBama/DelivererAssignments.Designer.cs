namespace GroceryBama
{
    partial class DelivererAssignments
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.button_order_date = new System.Windows.Forms.Button();
            this.button_order_name = new System.Windows.Forms.Button();
            this.comboSelect = new System.Windows.Forms.ComboBox();
            this.label2 = new System.Windows.Forms.Label();
            this.button_order_details = new System.Windows.Forms.Button();
            this.button_back = new System.Windows.Forms.Button();
            this.textAll = new System.Windows.Forms.TextBox();
            this.label3 = new System.Windows.Forms.Label();
            this.button_time = new System.Windows.Forms.Button();
            this.SuspendLayout();
            // 
            // button_order_date
            // 
            this.button_order_date.Location = new System.Drawing.Point(243, 496);
            this.button_order_date.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_order_date.Name = "button_order_date";
            this.button_order_date.Size = new System.Drawing.Size(107, 49);
            this.button_order_date.TabIndex = 80;
            this.button_order_date.Text = "Order By  Date";
            this.button_order_date.UseVisualStyleBackColor = true;
            this.button_order_date.Click += new System.EventHandler(this.button_order_date_Click);
            // 
            // button_order_name
            // 
            this.button_order_name.Location = new System.Drawing.Point(130, 496);
            this.button_order_name.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_order_name.Name = "button_order_name";
            this.button_order_name.Size = new System.Drawing.Size(107, 49);
            this.button_order_name.TabIndex = 79;
            this.button_order_name.Text = "Order By Name";
            this.button_order_name.UseVisualStyleBackColor = true;
            this.button_order_name.Click += new System.EventHandler(this.button_order_name_Click);
            // 
            // comboSelect
            // 
            this.comboSelect.FormattingEnabled = true;
            this.comboSelect.Location = new System.Drawing.Point(742, 510);
            this.comboSelect.Name = "comboSelect";
            this.comboSelect.Size = new System.Drawing.Size(121, 24);
            this.comboSelect.TabIndex = 78;
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(604, 513);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(132, 17);
            this.label2.TabIndex = 77;
            this.label2.Text = "Select Assignment: ";
            // 
            // button_order_details
            // 
            this.button_order_details.Location = new System.Drawing.Point(869, 497);
            this.button_order_details.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_order_details.Name = "button_order_details";
            this.button_order_details.Size = new System.Drawing.Size(107, 49);
            this.button_order_details.TabIndex = 76;
            this.button_order_details.Text = "Assignment Details";
            this.button_order_details.UseVisualStyleBackColor = true;
            this.button_order_details.Click += new System.EventHandler(this.button_order_details_Click);
            // 
            // button_back
            // 
            this.button_back.Location = new System.Drawing.Point(17, 497);
            this.button_back.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_back.Name = "button_back";
            this.button_back.Size = new System.Drawing.Size(107, 49);
            this.button_back.TabIndex = 75;
            this.button_back.Text = "Back";
            this.button_back.UseVisualStyleBackColor = true;
            this.button_back.Click += new System.EventHandler(this.button_back_Click);
            // 
            // textAll
            // 
            this.textAll.Location = new System.Drawing.Point(17, 55);
            this.textAll.Multiline = true;
            this.textAll.Name = "textAll";
            this.textAll.ReadOnly = true;
            this.textAll.ScrollBars = System.Windows.Forms.ScrollBars.Vertical;
            this.textAll.Size = new System.Drawing.Size(959, 436);
            this.textAll.TabIndex = 72;
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Font = new System.Drawing.Font("Microsoft Sans Serif", 16.2F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label3.Location = new System.Drawing.Point(397, 10);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(198, 32);
            this.label3.TabIndex = 71;
            this.label3.Text = "Assignments:";
            // 
            // button_time
            // 
            this.button_time.Location = new System.Drawing.Point(356, 496);
            this.button_time.Margin = new System.Windows.Forms.Padding(3, 2, 3, 2);
            this.button_time.Name = "button_time";
            this.button_time.Size = new System.Drawing.Size(107, 49);
            this.button_time.TabIndex = 81;
            this.button_time.Text = "Order By Time";
            this.button_time.UseVisualStyleBackColor = true;
            this.button_time.Click += new System.EventHandler(this.button_time_Click);
            // 
            // DelivererAssignments
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(993, 556);
            this.Controls.Add(this.button_time);
            this.Controls.Add(this.button_order_date);
            this.Controls.Add(this.button_order_name);
            this.Controls.Add(this.comboSelect);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.button_order_details);
            this.Controls.Add(this.button_back);
            this.Controls.Add(this.textAll);
            this.Controls.Add(this.label3);
            this.Name = "DelivererAssignments";
            this.Text = "DelivererAssignments";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button button_order_date;
        private System.Windows.Forms.Button button_order_name;
        private System.Windows.Forms.ComboBox comboSelect;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Button button_order_details;
        private System.Windows.Forms.Button button_back;
        private System.Windows.Forms.TextBox textAll;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Button button_time;
    }
}