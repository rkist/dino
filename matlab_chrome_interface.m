function works = test()
    works = 0;

    robot = java.awt.Robot;
    chrome_dir = '"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"';
    system([chrome_dir, ' www.google.com'])
    robot.keyPress (java.awt.event.KeyEvent.VK_CONTROL);
    robot.keyPress (java.awt.event.KeyEvent.VK_U);
    robot.keyRelease (java.awt.event.KeyEvent.VK_U);
    robot.keyRelease (java.awt.event.KeyEvent.VK_CONTROL);
    
    works = 1;

end