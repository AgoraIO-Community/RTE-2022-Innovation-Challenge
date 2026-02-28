package com.lambo.robot.drivers.hears.impl;

import com.lambo.robot.drivers.hears.IHear;
import com.lambo.robot.model.msgs.HearMsg;

import java.util.Scanner;

/**
 * 听.使用system.in.
 * Created by Administrator on 2017/7/22.
 */
public class SystemInHearImpl implements IHear {

    @Override
    public HearMsg listening() {
        Scanner scanner = new Scanner(System.in);
        String next = scanner.next();
        scanner.close();
        return new HearMsg(next);
    }

    @Override
    public void interrupt() {

    }
}
